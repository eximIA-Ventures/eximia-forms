import type { FieldBundle } from "./index";

function uid() {
  return crypto.randomUUID().slice(0, 8);
}

export const generalDemographicsBundle: FieldBundle = {
  id: "general-demographics",
  name: "Demografia Geral",
  description: "5 campos: faixa etária, gênero, escolaridade, renda, cidade/estado",
  icon: "Users",
  fields: [
    {
      id: uid(),
      type: "select",
      label: "Faixa etária",
      required: true,
      validation: [],
      conditions: [],
      properties: {
        options: [
          { label: "Menos de 18 anos", value: "menor_18" },
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
      id: uid(),
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
      id: uid(),
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
      id: uid(),
      type: "select",
      label: "Faixa de renda mensal",
      required: false,
      validation: [],
      conditions: [],
      properties: {
        options: [
          { label: "Até R$ 1.500", value: "ate_1500" },
          { label: "R$ 1.500 - R$ 3.000", value: "1500-3000" },
          { label: "R$ 3.000 - R$ 6.000", value: "3000-6000" },
          { label: "R$ 6.000 - R$ 12.000", value: "6000-12000" },
          { label: "Acima de R$ 12.000", value: "acima_12000" },
          { label: "Prefiro não informar", value: "nao_informar" },
        ],
      },
    },
    {
      id: uid(),
      type: "text",
      label: "Cidade / Estado",
      required: false,
      validation: [],
      conditions: [],
      properties: {},
      placeholder: "Ex: São Paulo - SP",
    },
  ],
};
