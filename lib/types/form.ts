// ======================================================================
// FORM SCHEMA — The core JSON schema that defines a form
// ======================================================================

export type FieldType =
  | "text"
  | "email"
  | "number"
  | "phone"
  | "url"
  | "textarea"
  | "richtext"
  | "select"
  | "multiselect"
  | "checkbox"
  | "radio"
  | "date"
  | "datetime"
  | "time"
  | "file"
  | "image"
  | "rating"
  | "scale"
  | "nps"
  | "heading"
  | "paragraph"
  | "divider";

export interface FormValidation {
  type: "required" | "min" | "max" | "minLength" | "maxLength" | "pattern" | "email" | "url";
  value?: string | number | boolean;
  message?: string;
}

export interface FormCondition {
  field: string; // element id
  operator: "equals" | "not_equals" | "contains" | "not_contains" | "greater_than" | "less_than" | "is_empty" | "is_not_empty";
  value?: string | number | boolean;
}

export interface FormElement {
  id: string;
  type: FieldType;
  label: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  validation: FormValidation[];
  conditions: FormCondition[];
  properties: Record<string, unknown>;
}

export interface FormPage {
  id: string;
  title?: string;
  description?: string;
  elements: FormElement[];
  conditions: FormCondition[];
}

export interface FormTheme {
  primaryColor: string;
  backgroundColor: string;
  fontFamily?: string;
  borderRadius?: number;
  logo?: string;
  mode?: "dark" | "light";
}

export interface FormSettings {
  allowMultipleSubmissions: boolean;
  showProgressBar: boolean;
  shufflePages: boolean;
  requireAuth: boolean;
  closeDate?: string;
  maxSubmissions?: number;
  redirectUrl?: string;
  thankYouTitle?: string;
  thankYouMessage?: string;
}

export interface FormSchema {
  version: 1;
  title: string;
  description?: string;
  settings: FormSettings;
  pages: FormPage[];
  theme?: FormTheme;
}

// ======================================================================
// DATABASE TYPES
// ======================================================================

export type FormStatus = "draft" | "published" | "closed" | "archived";

export interface FormWorkspace {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Form {
  id: string;
  workspace_id: string;
  title: string;
  slug: string;
  description: string | null;
  schema: FormSchema;
  status: FormStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FormSubmission {
  id: string;
  form_id: string;
  data: Record<string, unknown>;
  metadata: {
    user_agent?: string;
    ip_hash?: string;
    started_at?: string;
    completed_at?: string;
    duration_ms?: number;
  };
  is_complete: boolean;
  page_history: string[];
  created_at: string;
}

export interface FormAnalytics {
  id: string;
  form_id: string;
  date: string;
  views: number;
  starts: number;
  completions: number;
  drop_off_page: Record<string, number>;
}

export type AiAnalysisType = "summary" | "themes" | "sentiment" | "insights";

export interface FormAiAnalysis {
  id: string;
  form_id: string;
  type: AiAnalysisType;
  result: Record<string, unknown>;
  submission_count: number;
  created_at: string;
}

// ======================================================================
// FIELD METADATA — For builder palette
// ======================================================================

export interface FieldMeta {
  type: FieldType;
  label: string;
  icon: string;
  category: "input" | "choice" | "date" | "media" | "rating" | "layout";
  defaultProperties?: Record<string, unknown>;
}

export const FIELD_TYPES: FieldMeta[] = [
  // Input
  { type: "text", label: "Texto curto", icon: "Type", category: "input" },
  { type: "email", label: "Email", icon: "Mail", category: "input" },
  { type: "number", label: "Número", icon: "Hash", category: "input" },
  { type: "phone", label: "Telefone", icon: "Phone", category: "input" },
  { type: "url", label: "URL", icon: "Link", category: "input" },
  { type: "textarea", label: "Texto longo", icon: "AlignLeft", category: "input" },
  { type: "richtext", label: "Rich Text", icon: "FileText", category: "input" },

  // Choice
  { type: "select", label: "Dropdown", icon: "ChevronDown", category: "choice", defaultProperties: { options: [{ label: "Opção 1", value: "option_1" }] } },
  { type: "multiselect", label: "Multi-seleção", icon: "ListChecks", category: "choice", defaultProperties: { options: [{ label: "Opção 1", value: "option_1" }] } },
  { type: "checkbox", label: "Checkbox", icon: "CheckSquare", category: "choice" },
  { type: "radio", label: "Múltipla escolha", icon: "Circle", category: "choice", defaultProperties: { options: [{ label: "Opção 1", value: "option_1" }] } },

  // Date/Time
  { type: "date", label: "Data", icon: "Calendar", category: "date" },
  { type: "datetime", label: "Data e hora", icon: "CalendarClock", category: "date" },
  { type: "time", label: "Hora", icon: "Clock", category: "date" },

  // Media
  { type: "file", label: "Arquivo", icon: "Upload", category: "media", defaultProperties: { maxSize: 10, accept: "*/*" } },
  { type: "image", label: "Imagem", icon: "Image", category: "media", defaultProperties: { maxSize: 5, accept: "image/*" } },

  // Rating
  { type: "rating", label: "Avaliação", icon: "Star", category: "rating", defaultProperties: { max: 5 } },
  { type: "scale", label: "Escala", icon: "SlidersHorizontal", category: "rating", defaultProperties: { min: 1, max: 10, minLabel: "", maxLabel: "" } },
  { type: "nps", label: "NPS", icon: "BarChart3", category: "rating", defaultProperties: { min: 0, max: 10 } },

  // Layout
  { type: "heading", label: "Título", icon: "Heading", category: "layout" },
  { type: "paragraph", label: "Parágrafo", icon: "Text", category: "layout" },
  { type: "divider", label: "Divisor", icon: "Minus", category: "layout" },
];

export const FIELD_CATEGORIES = [
  { id: "input" as const, label: "Entrada" },
  { id: "choice" as const, label: "Escolha" },
  { id: "date" as const, label: "Data/Hora" },
  { id: "media" as const, label: "Mídia" },
  { id: "rating" as const, label: "Avaliação" },
  { id: "layout" as const, label: "Layout" },
];

// ======================================================================
// DEFAULTS
// ======================================================================

export function createDefaultFormSchema(): FormSchema {
  return {
    version: 1,
    title: "Formulário sem título",
    description: "",
    settings: {
      allowMultipleSubmissions: true,
      showProgressBar: true,
      shufflePages: false,
      requireAuth: false,
      thankYouTitle: "Obrigado!",
      thankYouMessage: "Sua resposta foi registrada com sucesso.",
    },
    theme: {
      primaryColor: "#C4A882",
      backgroundColor: "#0A0A0A",
      fontFamily: "Inter, system-ui, sans-serif",
      borderRadius: 8,
    },
    pages: [
      {
        id: crypto.randomUUID().slice(0, 8),
        title: "Página 1",
        elements: [],
        conditions: [],
      },
    ],
  };
}

export function createDefaultElement(type: FieldType): FormElement {
  const meta = FIELD_TYPES.find((f) => f.type === type);
  return {
    id: crypto.randomUUID().slice(0, 8),
    type,
    label: meta?.label || "Campo",
    required: false,
    validation: [],
    conditions: [],
    properties: meta?.defaultProperties ? { ...meta.defaultProperties } : {},
  };
}
