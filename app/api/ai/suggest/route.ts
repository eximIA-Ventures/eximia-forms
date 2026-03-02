import { NextResponse, type NextRequest } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const suggestSchema = z.object({
  suggestions: z.array(
    z.object({
      type: z.string().describe("Tipo do campo sugerido"),
      label: z.string().describe("Label do campo"),
      reason: z.string().describe("Por que este campo é relevante"),
    })
  ).max(5),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, existingFields } = await request.json();
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: suggestSchema,
      prompt: `Baseado no formulário "${title}", sugira até 5 campos que fariam sentido adicionar.

Campos já existentes: ${existingFields?.join(", ") || "nenhum"}

Tipos disponíveis: text, email, number, phone, url, textarea, select, multiselect, checkbox, radio, date, datetime, time, file, rating, scale, nps, heading, paragraph.

Sugira campos diferentes dos já existentes. Foque em campos que agregam valor ao formulário.`,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error("AI suggestion error:", error);
    return NextResponse.json(
      { error: "Falha ao gerar sugestões" },
      { status: 500 }
    );
  }
}
