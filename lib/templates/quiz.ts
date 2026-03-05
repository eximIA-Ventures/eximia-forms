import type { FormTemplate } from "./index";

export const quizTemplate: FormTemplate = {
  id: "quiz",
  name: "Quiz / Avaliação",
  description: "Perguntas de múltipla escolha com verificação de atenção",
  icon: "Brain",
  category: "quiz",
  schema: {
    version: 1,
    title: "Quiz de Conhecimento",
    description: "Teste seus conhecimentos! Responda todas as perguntas com atenção.",
    settings: {
      allowMultipleSubmissions: false,
      showProgressBar: true,
      shufflePages: false,
      requireAuth: false,
      thankYouTitle: "Quiz finalizado!",
      thankYouMessage: "Suas respostas foram registradas. Obrigado por participar!",
    },
    theme: {
      primaryColor: "#C4A882",
      backgroundColor: "#0A0A0A",
      fontFamily: "Inter, system-ui, sans-serif",
      borderRadius: 8,
    },
    pages: [
      {
        id: "intro_quiz",
        title: "Identificação",
        elements: [
          {
            id: "quiz_name",
            type: "text",
            label: "Seu nome",
            required: true,
            validation: [],
            conditions: [],
            properties: {},
          },
          {
            id: "quiz_email",
            type: "email",
            label: "Email (para envio do resultado)",
            required: true,
            validation: [],
            conditions: [],
            properties: {},
          },
        ],
        conditions: [],
      },
      {
        id: "questions_quiz",
        title: "Perguntas",
        elements: [
          {
            id: "quiz_q1",
            type: "radio",
            label: "[Pergunta 1] Substitua pelo enunciado da questão",
            required: true,
            validation: [],
            conditions: [],
            properties: {
              options: [
                { label: "Alternativa A", value: "a" },
                { label: "Alternativa B", value: "b" },
                { label: "Alternativa C", value: "c" },
                { label: "Alternativa D", value: "d" },
              ],
            },
          },
          {
            id: "quiz_q2",
            type: "radio",
            label: "[Pergunta 2] Substitua pelo enunciado da questão",
            required: true,
            validation: [],
            conditions: [],
            properties: {
              options: [
                { label: "Alternativa A", value: "a" },
                { label: "Alternativa B", value: "b" },
                { label: "Alternativa C", value: "c" },
                { label: "Alternativa D", value: "d" },
              ],
            },
          },
          {
            id: "quiz_attention",
            type: "attention_check",
            label: "Para confirmar que está atento, selecione a opção 'Concordo'",
            required: true,
            validation: [],
            conditions: [],
            properties: {
              displayType: "radio",
              correctAnswer: "concordo",
              options: [
                { label: "Discordo", value: "discordo" },
                { label: "Concordo", value: "concordo" },
                { label: "Não sei", value: "nao_sei" },
              ],
            },
          },
          {
            id: "quiz_q3",
            type: "radio",
            label: "[Pergunta 3] Substitua pelo enunciado da questão",
            required: true,
            validation: [],
            conditions: [],
            properties: {
              options: [
                { label: "Alternativa A", value: "a" },
                { label: "Alternativa B", value: "b" },
                { label: "Alternativa C", value: "c" },
                { label: "Alternativa D", value: "d" },
              ],
            },
          },
        ],
        conditions: [],
      },
    ],
  },
};
