import { NextResponse, type NextRequest } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { aiFormGenerationSchema } from "@/lib/validation/form-schema";
import type { FormSchema } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

// ── Category → prompt context mapping ────────────────────────────
const CATEGORY_CONTEXT: Record<string, string> = {
  survey:
    "Este é um formulário de PESQUISA. Priorize escalas (rating, scale, NPS), perguntas de múltipla escolha e campos abertos para comentários.",
  lead_gen:
    "Este é um formulário de CAPTAÇÃO DE LEADS. Foque em dados de contato (nome, email, telefone), dados de qualificação (empresa, cargo, orçamento) e perguntas sobre necessidades/dores.",
  feedback:
    "Este é um formulário de FEEDBACK. Use NPS (0-10) para lealdade, rating (estrelas) para satisfação, e campos abertos para sugestões e comentários.",
  registration:
    "Este é um formulário de CADASTRO/INSCRIÇÃO. Colete dados pessoais necessários, preferências e informações relevantes de forma organizada.",
  quiz:
    "Este é um QUIZ/AVALIAÇÃO. Use campos de múltipla escolha (radio, select) para as perguntas. Agrupe por tema ou nível de dificuldade.",
  event:
    "Este é um formulário de EVENTO. Colete dados pessoais, confirmação de presença, preferências logísticas (alimentação, transporte) e expectativas.",
  order:
    "Este é um formulário de PEDIDO/ORÇAMENTO. Colete dados de contato, detalhes do pedido, especificações, prazo e orçamento disponível.",
  nps:
    "Este é um formulário de NPS/SATISFAÇÃO. A pergunta principal deve ser NPS (0-10 'Qual a probabilidade de recomendar?'). Complemente com rating, motivos e sugestões.",
};

const TONE_CONTEXT: Record<string, string> = {
  formal: "Use linguagem formal e profissional. Labels e descrições devem ser respeitosos e diretos.",
  friendly: "Use linguagem amigável e acolhedora. Labels podem ser mais conversacionais e incluir textos de ajuda encorajadores.",
  casual: "Use linguagem casual e descontraída. Labels podem ser informais, use 'você' e tom leve.",
  professional: "Use linguagem profissional mas acessível. Equilibre formalidade com clareza.",
};

const LENGTH_CONTEXT: Record<string, string> = {
  short: "O formulário deve ser CURTO: 1-5 campos no total. Apenas o essencial.",
  medium: "O formulário deve ter tamanho MÉDIO: 6-15 campos. Bom equilíbrio entre informação e brevidade.",
  long: "O formulário pode ser LONGO: 16+ campos. Colete informações detalhadas e organize bem em páginas.",
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { prompt, category, tone, length, multiplePages, audience, existingFields, mode } =
    await request.json();
  if (!prompt) {
    return NextResponse.json(
      { error: "Prompt is required" },
      { status: 400 }
    );
  }

  // ── Build enriched prompt ──────────────────────────────────────
  const parts: string[] = [];

  if (mode === "import") {
    parts.push(
      "Você é um especialista em formulários. O usuário vai fornecer uma lista de perguntas JÁ PRONTAS.",
      "Sua tarefa é APENAS estruturar essas perguntas como campos de formulário.",
      "",
      "REGRAS:",
      "- NÃO invente perguntas novas. Use EXATAMENTE as perguntas fornecidas.",
      "- Detecte o tipo de campo mais adequado para cada pergunta:",
      "  • Perguntas com 'email' → email",
      "  • Perguntas com 'telefone/celular/whatsapp' → phone",
      "  • Perguntas com 'nome/empresa/cargo' → text",
      "  • Perguntas com opções listadas ou 'escolha/selecione' → select ou radio",
      "  • Perguntas com 'marque todos/quais dos' → multiselect",
      "  • Perguntas com 'nota de 0 a 10' ou 'recomendaria' → nps",
      "  • Perguntas com 'avalie/estrelas/satisfação' → rating",
      "  • Perguntas com 'de 1 a X' → scale",
      "  • Perguntas com 'data/quando' → date",
      "  • Perguntas com 'descreva/comente/explique' ou respostas longas → textarea",
      "  • Perguntas simples de resposta curta → text",
      "  • Perguntas com 'sim ou não/aceita/concorda' → radio com opções Sim/Não",
      "  • Perguntas com 'site/link/url' → url",
      "- Se a pergunta lista opções (ex: 'a) ... b) ... c) ...'), extraia-as como options",
      "- Use a pergunta original como label do campo",
      "- Marque como obrigatório campos que pareçam essenciais (nome, email, pergunta principal)",
      "- Organize em páginas lógicas se houver muitas perguntas (>5)",
      "- Gere um título e descrição apropriados para o formulário baseado no contexto das perguntas",
    );
  } else {
    parts.push(
      "Você é um especialista em criação de formulários. Crie um formulário baseado nas instruções abaixo.",
      "",
      "REGRAS GERAIS:",
      "- Use campos apropriados para cada tipo de informação",
      "- Use labels claros em português",
      "- Marque campos como obrigatórios quando fizer sentido",
      "- Para campos de escolha (select, radio), inclua opções relevantes",
      "- Use NPS (0-10) para perguntas de recomendação",
      "- Use rating (estrelas) para satisfação",
      "- Use scale para opiniões em espectro",
    );
  }

  if (mode !== "import") {
    // Category context
    if (category && CATEGORY_CONTEXT[category]) {
      parts.push("", `TIPO: ${CATEGORY_CONTEXT[category]}`);
    }

    // Tone
    if (tone && TONE_CONTEXT[tone]) {
      parts.push("", `TOM: ${TONE_CONTEXT[tone]}`);
    }

    // Length
    if (length && LENGTH_CONTEXT[length]) {
      parts.push("", `TAMANHO: ${LENGTH_CONTEXT[length]}`);
    }

    // Pages
    if (multiplePages === true) {
      parts.push("", "PÁGINAS: OBRIGATORIAMENTE use múltiplas páginas. Organize os campos em seções lógicas, cada seção em sua própria página.");
    } else if (multiplePages === false) {
      parts.push("", "PÁGINAS: Use APENAS uma única página. Todos os campos devem estar na mesma página.");
    } else {
      parts.push("", "PÁGINAS: Organize em páginas lógicas se o formulário tiver mais de 5 campos.");
    }

    // Audience
    if (audience) {
      parts.push("", `PÚBLICO-ALVO: ${audience}. Adapte a linguagem, os campos e as opções para esse público.`);
    }

    // Existing fields (append mode)
    if (existingFields?.length) {
      parts.push(
        "",
        `Campos já existentes no formulário (NÃO repita esses): ${existingFields.join(", ")}`,
        "Gere APENAS campos NOVOS que complementem os existentes."
      );
    }
  }

  // User input
  if (mode === "import") {
    parts.push("", "PERGUNTAS DO USUÁRIO:", prompt);
  } else {
    parts.push("", "DESCRIÇÃO DO FORMULÁRIO:", prompt);
  }

  const fullPrompt = parts.join("\n");

  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: aiFormGenerationSchema,
      prompt: fullPrompt,
    });

    // Convert AI output to full FormSchema
    const schema: FormSchema = {
      version: 1,
      title: object.title,
      description: object.description || "",
      settings: {
        allowMultipleSubmissions: true,
        showProgressBar: true,
        shufflePages: false,
        requireAuth: false,
        thankYouTitle: "Obrigado!",
        thankYouMessage: "Sua resposta foi registrada com sucesso.",
      },
      pages: object.pages.map((page, pageIndex) => ({
        id: crypto.randomUUID().slice(0, 8),
        title:
          page.title ??
          (object.pages.length > 1 ? `Página ${pageIndex + 1}` : undefined),
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
    };

    return NextResponse.json({ schema });
  } catch (error) {
    console.error("AI generation error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Falha ao gerar formulário com IA", detail: message },
      { status: 500 }
    );
  }
}
