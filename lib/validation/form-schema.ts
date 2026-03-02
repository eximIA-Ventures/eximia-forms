import { z } from "zod";

// ======================================================================
// ZOD SCHEMAS — Used for AI generation + API validation
// ======================================================================

export const fieldValidationSchema = z.object({
  type: z.enum(["required", "min", "max", "minLength", "maxLength", "pattern", "email", "url"]),
  value: z.union([z.string(), z.number(), z.boolean()]).optional(),
  message: z.string().optional(),
});

export const fieldConditionSchema = z.object({
  field: z.string(),
  operator: z.enum(["equals", "not_equals", "contains", "not_contains", "greater_than", "less_than", "is_empty", "is_not_empty"]),
  value: z.union([z.string(), z.number(), z.boolean()]).optional(),
});

export const fieldTypeSchema = z.enum([
  "text", "email", "number", "phone", "url", "textarea", "richtext",
  "select", "multiselect", "checkbox", "radio",
  "date", "datetime", "time",
  "file", "image",
  "rating", "scale", "nps",
  "heading", "paragraph", "divider",
]);

export const formElementSchema = z.object({
  id: z.string(),
  type: fieldTypeSchema,
  label: z.string(),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
  validation: z.array(fieldValidationSchema).default([]),
  conditions: z.array(fieldConditionSchema).default([]),
  properties: z.record(z.unknown()).default({}),
});

export const formPageSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  elements: z.array(formElementSchema),
  conditions: z.array(fieldConditionSchema).default([]),
});

export const formThemeSchema = z.object({
  primaryColor: z.string(),
  backgroundColor: z.string(),
  fontFamily: z.string().optional(),
  borderRadius: z.number().optional(),
  logo: z.string().optional(),
});

export const formSettingsSchema = z.object({
  allowMultipleSubmissions: z.boolean().default(true),
  showProgressBar: z.boolean().default(true),
  shufflePages: z.boolean().default(false),
  requireAuth: z.boolean().default(false),
  closeDate: z.string().optional(),
  maxSubmissions: z.number().optional(),
  redirectUrl: z.string().optional(),
  thankYouTitle: z.string().optional(),
  thankYouMessage: z.string().optional(),
});

export const formSchemaValidator = z.object({
  version: z.literal(1),
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  settings: formSettingsSchema,
  pages: z.array(formPageSchema).min(1, "Pelo menos uma página é necessária"),
  theme: formThemeSchema.optional(),
});

// Schema for AI generation — all fields required with nullable for OpenAI structured outputs
export const aiFormGenerationSchema = z.object({
  title: z.string().describe("Título do formulário"),
  description: z.string().nullable().describe("Descrição breve do formulário ou null"),
  pages: z.array(
    z.object({
      title: z.string().nullable().describe("Título da página ou null"),
      elements: z.array(
        z.object({
          type: fieldTypeSchema.describe("Tipo do campo"),
          label: z.string().describe("Label visível do campo"),
          description: z.string().nullable().describe("Texto de ajuda ou null"),
          placeholder: z.string().nullable().describe("Placeholder ou null"),
          required: z.boolean().describe("Se o campo é obrigatório"),
          options: z.array(z.string()).nullable().describe("Opções para select, radio, multiselect, checkbox. null se não aplicável"),
          min: z.number().nullable().describe("Valor mínimo para scale, rating, nps. null se não aplicável"),
          max: z.number().nullable().describe("Valor máximo para scale, rating, nps. null se não aplicável"),
        })
      ),
    })
  ).describe("Páginas do formulário"),
});

export type AiFormGeneration = z.infer<typeof aiFormGenerationSchema>;
