import { NextResponse, type NextRequest } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkAiAccess, incrementAiUsage } from "@/lib/plans-check";

const analysisSchema = z.object({
  summary: z.string().describe("Resumo geral das respostas em 2-3 frases"),
  themes: z.array(
    z.object({
      name: z.string().describe("Nome do tema identificado"),
      count: z.number().describe("Número aproximado de menções"),
      description: z.string().describe("Descrição do tema"),
    })
  ).describe("Temas principais identificados nas respostas"),
  sentiment: z.object({
    positive: z.number().min(0).max(100).describe("Percentual positivo"),
    neutral: z.number().min(0).max(100).describe("Percentual neutro"),
    negative: z.number().min(0).max(100).describe("Percentual negativo"),
  }),
  insights: z.array(
    z.string().describe("Um insight acionável baseado nos dados")
  ).max(5).describe("Insights práticos extraídos das respostas"),
  npsAnalysis: z.object({
    promoters: z.number().describe("Percentual de promotores (9-10)"),
    passives: z.number().describe("Percentual de passivos (7-8)"),
    detractors: z.number().describe("Percentual de detratores (0-6)"),
    score: z.number().describe("NPS score (-100 a 100)"),
  }).optional().describe("Análise NPS se houver campo NPS"),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const aiCheck = await checkAiAccess(user.id);
  if (!aiCheck.allowed) {
    return NextResponse.json({ error: aiCheck.reason, code: "PLAN_LIMIT" }, { status: 403 });
  }

  const { formId, type } = await request.json();
  if (!formId) {
    return NextResponse.json({ error: "formId is required" }, { status: 400 });
  }

  // Load form and submissions
  const { data: form } = await supabase
    .from("forms")
    .select("schema")
    .eq("id", formId)
    .single();

  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  const { data: submissions } = await supabase
    .from("form_submissions")
    .select("data")
    .eq("form_id", formId)
    .eq("is_complete", true)
    .order("created_at", { ascending: false })
    .limit(500);

  if (!submissions || submissions.length === 0) {
    return NextResponse.json(
      { error: "No submissions to analyze" },
      { status: 400 }
    );
  }

  // Build field mapping
  const fields = (form.schema as { pages: Array<{ elements: Array<{ id: string; label: string; type: string }> }> })
    .pages.flatMap((p) => p.elements)
    .filter((el) => !["heading", "paragraph", "divider"].includes(el.type));

  const formattedSubmissions = submissions.map((sub) => {
    const formatted: Record<string, unknown> = {};
    for (const field of fields) {
      formatted[field.label] = sub.data[field.id] ?? "";
    }
    return formatted;
  });

  try {
    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: analysisSchema,
      prompt: `Analise as ${submissions.length} respostas de um formulário e forneça insights.

Formulário: ${(form.schema as { title: string }).title}

Campos do formulário: ${fields.map((f) => `${f.label} (${f.type})`).join(", ")}

Respostas (JSON):
${JSON.stringify(formattedSubmissions.slice(0, 100), null, 2)}
${submissions.length > 100 ? `\n... e mais ${submissions.length - 100} respostas similares.` : ""}

Analise considerando:
1. Padrões nas respostas de texto
2. Distribuição nas respostas de escolha
3. Tendências nos ratings e NPS
4. Correlações entre campos
5. Insights acionáveis para melhorar o formulário ou o negócio`,
    });

    // Cache the analysis
    await supabase.from("form_ai_analyses").insert({
      form_id: formId,
      type: type || "full",
      result: object as unknown as Record<string, unknown>,
      submission_count: submissions.length,
    });

    await incrementAiUsage(user.id);
    return NextResponse.json(object);
  } catch (error) {
    console.error("AI analysis error:", error);
    return NextResponse.json(
      { error: "Falha ao analisar respostas" },
      { status: 500 }
    );
  }
}
