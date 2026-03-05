import type { FormSchema } from "@/lib/types";

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  schema: FormSchema;
}

// Template registry — import and register templates here
import { academicQuestionnaireTemplate } from "./academic-questionnaire";
import { satisfactionSurveyTemplate } from "./satisfaction-survey";
import { leadCaptureTemplate } from "./lead-capture";
import { eventFeedbackTemplate } from "./event-feedback";
import { registrationTemplate } from "./registration";
import { quizTemplate } from "./quiz";
import { organizationalClimateTemplate } from "./organizational-climate";

export const FORM_TEMPLATES: FormTemplate[] = [
  academicQuestionnaireTemplate,
  satisfactionSurveyTemplate,
  leadCaptureTemplate,
  eventFeedbackTemplate,
  registrationTemplate,
  quizTemplate,
  organizationalClimateTemplate,
];

export function getTemplate(id: string): FormTemplate | undefined {
  return FORM_TEMPLATES.find((t) => t.id === id);
}
