import type { FormCondition } from "@/lib/types";

/**
 * Evaluate a single condition against the current answers.
 */
export function evaluateCondition(
  condition: FormCondition,
  answers: Record<string, unknown>
): boolean {
  const fieldValue = answers[condition.field];

  switch (condition.operator) {
    case "is_empty":
      return fieldValue === undefined || fieldValue === null || fieldValue === "" || (Array.isArray(fieldValue) && fieldValue.length === 0);

    case "is_not_empty":
      return fieldValue !== undefined && fieldValue !== null && fieldValue !== "" && !(Array.isArray(fieldValue) && fieldValue.length === 0);

    case "equals":
      return String(fieldValue) === String(condition.value);

    case "not_equals":
      return String(fieldValue) !== String(condition.value);

    case "contains": {
      const str = String(fieldValue ?? "");
      return str.toLowerCase().includes(String(condition.value ?? "").toLowerCase());
    }

    case "not_contains": {
      const str = String(fieldValue ?? "");
      return !str.toLowerCase().includes(String(condition.value ?? "").toLowerCase());
    }

    case "greater_than":
      return Number(fieldValue) > Number(condition.value);

    case "less_than":
      return Number(fieldValue) < Number(condition.value);

    default:
      return true;
  }
}

/**
 * Evaluate ALL conditions for an element (AND logic).
 * Empty conditions array → always visible (returns true).
 */
export function evaluateConditions(
  conditions: FormCondition[],
  answers: Record<string, unknown>
): boolean {
  if (!conditions || conditions.length === 0) return true;
  return conditions.every((c) => evaluateCondition(c, answers));
}
