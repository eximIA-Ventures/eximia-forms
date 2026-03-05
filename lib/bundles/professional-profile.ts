import type { FieldBundle } from "./index";

function uid() {
  return crypto.randomUUID().slice(0, 8);
}

export const professionalProfileBundle: FieldBundle = {
  id: "professional-profile",
  name: "Perfil Profissional",
  description: "5 campos: cargo, empresa, setor, experiência, porte da empresa",
  icon: "Briefcase",
  fields: [
    {
      id: uid(),
      type: "text",
      label: "Cargo atual",
      required: true,
      validation: [],
      conditions: [],
      properties: {},
      placeholder: "Ex: Gerente de Projetos",
    },
    {
      id: uid(),
      type: "text",
      label: "Empresa",
      required: true,
      validation: [],
      conditions: [],
      properties: {},
      placeholder: "Nome da empresa",
    },
    {
      id: uid(),
      type: "select",
      label: "Setor de atuação",
      required: true,
      validation: [],
      conditions: [],
      properties: {
        options: [
          { label: "Tecnologia", value: "tecnologia" },
          { label: "Saúde", value: "saude" },
          { label: "Educação", value: "educacao" },
          { label: "Financeiro", value: "financeiro" },
          { label: "Varejo / Comércio", value: "varejo" },
          { label: "Indústria", value: "industria" },
          { label: "Agronegócio", value: "agro" },
          { label: "Serviços", value: "servicos" },
          { label: "Governo / Público", value: "governo" },
          { label: "Outro", value: "outro" },
        ],
      },
    },
    {
      id: uid(),
      type: "select",
      label: "Tempo de experiência profissional",
      required: true,
      validation: [],
      conditions: [],
      properties: {
        options: [
          { label: "Menos de 1 ano", value: "0-1" },
          { label: "1-3 anos", value: "1-3" },
          { label: "3-5 anos", value: "3-5" },
          { label: "5-10 anos", value: "5-10" },
          { label: "10-20 anos", value: "10-20" },
          { label: "Mais de 20 anos", value: "20+" },
        ],
      },
    },
    {
      id: uid(),
      type: "select",
      label: "Porte da empresa",
      required: false,
      validation: [],
      conditions: [],
      properties: {
        options: [
          { label: "MEI / Autônomo", value: "mei" },
          { label: "Micro (até 9 func.)", value: "micro" },
          { label: "Pequena (10-49 func.)", value: "pequena" },
          { label: "Média (50-249 func.)", value: "media" },
          { label: "Grande (250+ func.)", value: "grande" },
        ],
      },
    },
  ],
};
