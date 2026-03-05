import type { FormElement, FormPage } from "@/lib/types";

export type DiffAction = "added" | "removed" | "modified";
export type DiffMode = "replace" | "append";

export interface ElementDiff {
  action: DiffAction;
  element: FormElement;
  /** Only present for "modified" — the original element before changes */
  before?: FormElement;
  /** Changed property keys (for modified elements) */
  changedKeys?: string[];
}

export interface PageChange {
  pageIndex: number;
  pageTitle?: string;
  action: "added" | "removed" | "unchanged";
}

export interface SchemaDiff {
  added: ElementDiff[];
  removed: ElementDiff[];
  modified: ElementDiff[];
  pageChanges: PageChange[];
}

export interface AiPreviewState {
  isOpen: boolean;
  proposed: FormElement[] | null;
  diff: SchemaDiff | null;
  mode: DiffMode;
  /** Refinement prompt for "Ajustar" action */
  refinementPrompt: string;
}
