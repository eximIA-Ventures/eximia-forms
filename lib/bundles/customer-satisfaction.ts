import type { FieldBundle } from "./index";

function uid() {
  return crypto.randomUUID().slice(0, 8);
}

export const customerSatisfactionBundle: FieldBundle = {
  id: "customer-satisfaction",
  name: "Satisfação do Cliente",
  description: "4 campos: NPS, rating geral, usaria novamente, sugestão de melhoria",
  icon: "Heart",
  fields: [
    {
      id: uid(),
      type: "nps",
      label: "De 0 a 10, qual a probabilidade de nos recomendar?",
      required: true,
      validation: [],
      conditions: [],
      properties: { min: 0, max: 10 },
    },
    {
      id: uid(),
      type: "rating",
      label: "Satisfação geral",
      description: "Como avalia sua experiência?",
      required: true,
      validation: [],
      conditions: [],
      properties: { max: 5 },
    },
    {
      id: uid(),
      type: "radio",
      label: "Usaria nossos serviços novamente?",
      required: true,
      validation: [],
      conditions: [],
      properties: {
        options: [
          { label: "Com certeza", value: "certeza" },
          { label: "Provavelmente sim", value: "provavelmente" },
          { label: "Talvez", value: "talvez" },
          { label: "Provavelmente não", value: "provavelmente_nao" },
          { label: "Não", value: "nao" },
        ],
      },
    },
    {
      id: uid(),
      type: "textarea",
      label: "O que podemos melhorar?",
      required: false,
      validation: [],
      conditions: [],
      properties: {},
    },
  ],
};
