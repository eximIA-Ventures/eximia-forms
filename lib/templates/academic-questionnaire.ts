import type { FormTemplate } from "./index";

export const academicQuestionnaireTemplate: FormTemplate = {
  id: "academic-questionnaire",
  name: "Questionário Acadêmico",
  description: "Template de pesquisa acadêmica com 5 seções: Introdução, Instruções, Questões, Demográficos e Agradecimento",
  icon: "GraduationCap",
  category: "research",
  schema: {
    version: 1,
    title: "Questionário de Pesquisa",
    description: "Pesquisa acadêmica — sua participação é voluntária e anônima.",
    settings: {
      allowMultipleSubmissions: false,
      showProgressBar: true,
      shufflePages: false,
      requireAuth: false,
      thankYouTitle: "Agradecemos sua participação!",
      thankYouMessage: "Suas respostas foram registradas com sucesso. Sua contribuição é fundamental para esta pesquisa.",
    },
    theme: {
      primaryColor: "#C4A882",
      backgroundColor: "#0A0A0A",
      fontFamily: "Inter, system-ui, sans-serif",
      borderRadius: 8,
    },
    pages: [
      // Page 1: Introdução
      {
        id: "intro",
        title: "Introdução",
        elements: [
          {
            id: "intro_heading",
            type: "heading",
            label: "Bem-vindo(a) à nossa pesquisa",
            required: false,
            validation: [],
            conditions: [],
            properties: { content: "Bem-vindo(a) à nossa pesquisa" },
          },
          {
            id: "intro_context",
            type: "paragraph",
            label: "Contexto",
            required: false,
            validation: [],
            conditions: [],
            properties: {
              content:
                "Esta pesquisa faz parte de um estudo acadêmico sobre [TEMA DA PESQUISA]. Seu objetivo é [OBJETIVO]. A participação é voluntária, anônima e leva aproximadamente [X] minutos. Os dados serão utilizados exclusivamente para fins acadêmicos.",
            },
          },
          {
            id: "consent",
            type: "checkbox",
            label: "Li e concordo em participar voluntariamente desta pesquisa",
            required: true,
            validation: [],
            conditions: [],
            properties: {},
          },
        ],
        conditions: [],
      },
      // Page 2: Instruções
      {
        id: "instructions",
        title: "Instruções",
        elements: [
          {
            id: "instr_heading",
            type: "heading",
            label: "Como responder",
            required: false,
            validation: [],
            conditions: [],
            properties: { content: "Como responder" },
          },
          {
            id: "instr_text",
            type: "paragraph",
            label: "Orientações",
            required: false,
            validation: [],
            conditions: [],
            properties: {
              content:
                "• Não existem respostas certas ou erradas\n• Responda com base na sua experiência pessoal\n• Caso não se sinta confortável com alguma pergunta, pode deixá-la em branco\n• Tempo estimado: [X] minutos",
            },
          },
        ],
        conditions: [],
      },
      // Page 3: Questões (placeholder)
      {
        id: "questions",
        title: "Questões",
        elements: [
          {
            id: "q_heading",
            type: "heading",
            label: "Questões da pesquisa",
            required: false,
            validation: [],
            conditions: [],
            properties: { content: "Questões da pesquisa" },
          },
          {
            id: "q1",
            type: "scale",
            label: "Em que medida você concorda com a seguinte afirmação?",
            description: "[Substitua pela sua pergunta]",
            required: true,
            validation: [],
            conditions: [],
            properties: { min: 1, max: 5, minLabel: "Discordo totalmente", maxLabel: "Concordo totalmente" },
          },
          {
            id: "q2",
            type: "textarea",
            label: "Descreva sua experiência com [TEMA]",
            description: "[Substitua pela sua pergunta aberta]",
            required: false,
            validation: [],
            conditions: [],
            properties: {},
          },
        ],
        conditions: [],
      },
      // Page 4: Demográficos
      {
        id: "demographics",
        title: "Dados demográficos",
        elements: [
          {
            id: "demo_heading",
            type: "heading",
            label: "Perfil do respondente",
            required: false,
            validation: [],
            conditions: [],
            properties: { content: "Perfil do respondente" },
          },
          {
            id: "demo_age",
            type: "select",
            label: "Faixa etária",
            required: true,
            validation: [],
            conditions: [],
            properties: {
              options: [
                { label: "18-24 anos", value: "18-24" },
                { label: "25-34 anos", value: "25-34" },
                { label: "35-44 anos", value: "35-44" },
                { label: "45-54 anos", value: "45-54" },
                { label: "55-64 anos", value: "55-64" },
                { label: "65+ anos", value: "65+" },
              ],
            },
          },
          {
            id: "demo_gender",
            type: "radio",
            label: "Gênero",
            required: true,
            validation: [],
            conditions: [],
            properties: {
              options: [
                { label: "Masculino", value: "masculino" },
                { label: "Feminino", value: "feminino" },
                { label: "Outro", value: "outro" },
                { label: "Prefiro não informar", value: "nao_informar" },
              ],
            },
          },
          {
            id: "demo_education",
            type: "select",
            label: "Escolaridade",
            required: true,
            validation: [],
            conditions: [],
            properties: {
              options: [
                { label: "Ensino Fundamental", value: "fundamental" },
                { label: "Ensino Médio", value: "medio" },
                { label: "Graduação", value: "graduacao" },
                { label: "Pós-graduação / MBA", value: "pos_graduacao" },
                { label: "Mestrado", value: "mestrado" },
                { label: "Doutorado", value: "doutorado" },
              ],
            },
          },
          {
            id: "demo_city",
            type: "text",
            label: "Município / Estado",
            required: false,
            validation: [],
            conditions: [],
            properties: {},
            placeholder: "Ex: Ribeirão Preto - SP",
          },
        ],
        conditions: [],
      },
    ],
  },
};
