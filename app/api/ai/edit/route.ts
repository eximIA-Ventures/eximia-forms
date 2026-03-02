import { NextResponse, type NextRequest } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { aiFormGenerationSchema } from "@/lib/validation/form-schema";
import type { FormSchema } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { instruction, currentSchema } = await request.json();
  if (!instruction) {
    return NextResponse.json({ error: "Instruction is required" }, { status: 400 });
  }
  if (!currentSchema) {
    return NextResponse.json({ error: "Current schema is required" }, { status: 400 });
  }

  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: aiFormGenerationSchema,
      prompt: `Você é um especialista em formulários. Modifique o formulário existente conforme a instrução do usuário.

FORMULÁRIO ATUAL (JSON):
${JSON.stringify(currentSchema, null, 2)}

INSTRUÇÃO DO USUÁRIO:
${instruction}

REGRAS:
- Mantenha TODOS os campos existentes a menos que a instrução peça explicitamente para remover
- Aplique APENAS as mudanças solicitadas
- Preserve a estrutura de páginas existente a menos que peçam para reorganizar
- Use labels claros em português
- Para campos de escolha, inclua opções relevantes
- Retorne o formulário COMPLETO modificado (não apenas as mudanças)`,
    });

    // Convert AI output to full FormSchema
    const schema: FormSchema = {
      version: 1,
      title: object.title,
      description: object.description || "",
      settings: currentSchema.settings || {
        allowMultipleSubmissions: true,
        showProgressBar: true,
        shufflePages: false,
        requireAuth: false,
        thankYouTitle: "Obrigado!",
        thankYouMessage: "Sua resposta foi registrada com sucesso.",
      },
      pages: object.pages.map((page, pageIndex) => ({
        id: crypto.randomUUID().slice(0, 8),
        title: page.title ?? (object.pages.length > 1 ? `Página ${pageIndex + 1}` : undefined),
        elements: page.elements.map((el) => {
          const properties: Record<string, unknown> = {};
          if (el.options) properties.options = el.options;
          if (el.min != null) properties.min = el.min;
          if (el.max != null) properties.max = el.max;
          return {
            id: crypto.randomUUID().slice(0, 8),
            type: el.type,
            label: el.label,
            description: el.description ?? undefined,
            placeholder: el.placeholder ?? undefined,
            required: el.required ?? false,
            validation: [],
            conditions: [],
            properties,
          };
        }),
        conditions: [],
      })),
      theme: currentSchema.theme,
    };

    return NextResponse.json({ schema });
  } catch (error) {
    console.error("AI edit error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Falha ao editar formulário com IA", detail: message },
      { status: 500 }
    );
  }
}
