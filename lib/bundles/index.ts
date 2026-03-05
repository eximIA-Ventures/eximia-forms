import type { FormElement } from "@/lib/types";

export interface FieldBundle {
  id: string;
  name: string;
  description: string;
  icon: string;
  fields: FormElement[];
}

// Import bundles
import { agroBundles } from "./agro-demographics";
import { generalDemographicsBundle } from "./general-demographics";
import { customerSatisfactionBundle } from "./customer-satisfaction";
import { professionalProfileBundle } from "./professional-profile";
import { contactInfoBundle } from "./contact-info";
import { lgpdConsentBundle } from "./lgpd-consent";

export const FIELD_BUNDLES: FieldBundle[] = [
  ...agroBundles,
  generalDemographicsBundle,
  customerSatisfactionBundle,
  professionalProfileBundle,
  contactInfoBundle,
  lgpdConsentBundle,
];

export function getBundle(id: string): FieldBundle | undefined {
  return FIELD_BUNDLES.find((b) => b.id === id);
}
