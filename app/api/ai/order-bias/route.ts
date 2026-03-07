import { NextResponse, type NextRequest } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkAiAccess, incrementAiUsage } from "@/lib/plans-check";

const analysisResultSchema = z.object({
  warnings: z.array(z.object({
    severity: z.enum(["high", "medium", "low"]),
    description: z.string(),
    affectedFields: z.array(z.string()),
    suggestion: z.string(),
    type: z.enum(["funnel", "correlation", "randomization", "sensitivity"]),
  })),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const aiCheck = await checkAiAccess(user.id);
  if (!aiCheck.allowed) {
    return NextResponse.json({ error: aiCheck.reason, code: "PLAN_LIMIT" }, { status: 403 });
  }

  const { schema } = await request.json();
  if (!schema) {
    return NextResponse.json({ error: "Schema is required" }, { status: 400 });
  }

  // Build field summary for the AI
  const fieldSummary = schema.pages.map((page: { title?: string; elements: Array<{ id: string; type: string; label: string; properties?: Record<string, unknown> }>; shuffleElements?: boolean }, pageIdx: number) => {
    const fields = page.elements.map((el: { id: string; type: string; label: string }) =>
      `  - [${el.id}] (${el.type}) "${el.label}"`
    ).join("\n");
    return `Página ${pageIdx + 1}${page.title ? ` — "${page.title}"` : ""} (shuffleElements: ${page.shuffleElements ? "sim" : "não"}):\n${fields}`;
  }).join("\n\n");

  const prompt = `Analise a ordem das questões neste formulário de pesquisa.
Identifique problemas de viés de ordem baseado nestes princípios:

1. TÉCNICA DE FUNIL: Perguntas gerais devem vir antes de específicas.
   Se uma pergunta específica aparece antes de uma geral sobre o mesmo tema, é um problema.

2. CORRELAÇÃO: Itens altamente correlacionados (mesma variável, mesmo constructo)
   devem estar LONGE uns dos outros para evitar halo effect.

3. RANDOMIZAÇÃO: Páginas com 4+ questões de escolha (radio, select, multiselect, scale, rating) sem shuffle habilitado devem ter shuffle sugerido.

4. SENSIBILIDADE: Perguntas sensíveis (renda, idade, gênero, opinião controversa, dados pessoais)
   devem ficar NO FINAL do questionário, não no início.

Para cada problema encontrado, retorne:
- severity: "high" | "medium" | "low"
- description: descrição em português do problema
- affectedFields: array com IDs dos campos afetados
- suggestion: ação sugerida em português
- type: "funnel" | "correlation" | "randomization" | "sensitivity"

Se não encontrar problemas, retorne array vazio de warnings.
Seja rigoroso mas não excessivo — apenas problemas reais.

FORMULÁRIO:
${fieldSummary}`;

  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: analysisResultSchema,
      prompt,
    });

    await incrementAiUsage(user.id);
    return NextResponse.json(object);
  } catch (error) {
    console.error("AI analysis error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Falha ao analisar formulário", detail: message },
      { status: 500 }
    );
  }
}
