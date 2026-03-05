import type { FormElement, FormSchema } from "@/lib/types";
import type { SchemaDiff, ElementDiff, PageChange, DiffMode } from "./types";

/**
 * Compute a diff between the current schema and a proposed schema from AI.
 * Match elements by ID first, then fallback by label.
 */
export function computeSchemaDiff(
  current: FormSchema,
  proposed: FormSchema,
  mode: DiffMode = "replace"
): SchemaDiff {
  const currentElements = current.pages.flatMap((p) => p.elements);
  const proposedElements = proposed.pages.flatMap((p) => p.elements);

  // Build lookup maps
  const currentById = new Map(currentElements.map((el) => [el.id, el]));
  const currentByLabel = new Map(currentElements.map((el) => [el.label.toLowerCase().trim(), el]));

  const matched = new Set<string>(); // IDs of current elements that matched
  const added: ElementDiff[] = [];
  const modified: ElementDiff[] = [];

  for (const proposed of proposedElements) {
    // Try match by ID first
    let match = currentById.get(proposed.id);

    // Fallback: match by label
    if (!match) {
      match = currentByLabel.get(proposed.label.toLowerCase().trim());
    }

    if (match) {
      matched.add(match.id);
      // Check if modified
      const changedKeys = getChangedKeys(match, proposed);
      if (changedKeys.length > 0) {
        modified.push({
          action: "modified",
          element: proposed,
          before: match,
          changedKeys,
        });
      }
    } else {
      added.push({ action: "added", element: proposed });
    }
  }

  // In append mode, removed is always empty
  const removed: ElementDiff[] = [];
  if (mode === "replace") {
    for (const el of currentElements) {
      if (!matched.has(el.id)) {
        removed.push({ action: "removed", element: el });
      }
    }
  }

  // Page changes
  const pageChanges: PageChange[] = computePageChanges(current, proposed);

  return { added, removed, modified, pageChanges };
}

function getChangedKeys(before: FormElement, after: FormElement): string[] {
  const keys: string[] = [];
  if (before.label !== after.label) keys.push("label");
  if (before.type !== after.type) keys.push("type");
  if (before.required !== after.required) keys.push("required");
  if (before.description !== after.description) keys.push("description");
  if (before.placeholder !== after.placeholder) keys.push("placeholder");
  if (JSON.stringify(before.properties) !== JSON.stringify(after.properties)) keys.push("properties");
  if (JSON.stringify(before.conditions) !== JSON.stringify(after.conditions)) keys.push("conditions");
  if (JSON.stringify(before.validation) !== JSON.stringify(after.validation)) keys.push("validation");
  return keys;
}

function computePageChanges(current: FormSchema, proposed: FormSchema): PageChange[] {
  const changes: PageChange[] = [];
  const maxLen = Math.max(current.pages.length, proposed.pages.length);

  for (let i = 0; i < maxLen; i++) {
    const cur = current.pages[i];
    const prop = proposed.pages[i];

    if (!cur && prop) {
      changes.push({ pageIndex: i, pageTitle: prop.title, action: "added" });
    } else if (cur && !prop) {
      changes.push({ pageIndex: i, pageTitle: cur.title, action: "removed" });
    } else {
      changes.push({ pageIndex: i, pageTitle: prop?.title || cur?.title, action: "unchanged" });
    }
  }

  return changes;
}
