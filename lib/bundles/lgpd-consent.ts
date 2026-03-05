import type { FieldBundle } from "./index";

function uid() {
  return crypto.randomUUID().slice(0, 8);
}

export const lgpdConsentBundle: FieldBundle = {
  id: "lgpd-consent",
  name: "Consentimento LGPD",
  description: "3 campos: aviso de privacidade, consentimento geral, consentimento dados sensíveis",
  icon: "ShieldCheck",
  fields: [
    {
      id: uid(),
      type: "paragraph",
      label: "Aviso de Privacidade",
      required: false,
      validation: [],
      conditions: [],
      properties: {
        content:
          "Em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018), informamos que os dados coletados neste formulário serão utilizados exclusivamente para a finalidade descrita acima. Seus dados não serão compartilhados com terceiros sem seu consentimento prévio. Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento.",
      },
    },
    {
      id: uid(),
      type: "checkbox",
      label: "Autorizo a coleta e tratamento dos meus dados pessoais conforme descrito acima",
      required: true,
      validation: [],
      conditions: [],
      properties: {},
    },
    {
      id: uid(),
      type: "checkbox",
      label: "Autorizo o tratamento de dados sensíveis (saúde, origem racial, opinião política, etc.), quando aplicável",
      required: false,
      validation: [],
      conditions: [],
      properties: {},
    },
  ],
};
