import type { FieldBundle } from "./index";

function uid() {
  return crypto.randomUUID().slice(0, 8);
}

export const contactInfoBundle: FieldBundle = {
  id: "contact-info",
  name: "Contato",
  description: "5 campos: nome, email, telefone, empresa, como conheceu",
  icon: "Contact",
  fields: [
    {
      id: uid(),
      type: "text",
      label: "Nome completo",
      required: true,
      validation: [],
      conditions: [],
      properties: {},
    },
    {
      id: uid(),
      type: "email",
      label: "Email",
      required: true,
      validation: [],
      conditions: [],
      properties: {},
      placeholder: "seu@email.com",
    },
    {
      id: uid(),
      type: "phone",
      label: "Telefone / WhatsApp",
      required: false,
      validation: [],
      conditions: [],
      properties: {},
      placeholder: "(11) 99999-9999",
    },
    {
      id: uid(),
      type: "text",
      label: "Empresa",
      required: false,
      validation: [],
      conditions: [],
      properties: {},
    },
    {
      id: uid(),
      type: "select",
      label: "Como nos conheceu?",
      required: false,
      validation: [],
      conditions: [],
      properties: {
        options: [
          { label: "Redes sociais", value: "redes_sociais" },
          { label: "Indicação", value: "indicacao" },
          { label: "Google / busca", value: "google" },
          { label: "Email / newsletter", value: "email" },
          { label: "Evento", value: "evento" },
          { label: "Outro", value: "outro" },
        ],
      },
    },
  ],
};
