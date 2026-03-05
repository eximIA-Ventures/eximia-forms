"use client";

import { useBuilderStore } from "@/stores/builder-store";
import { Button, Input } from "@/components/ui";
import { Plus, Trash2, GitBranch } from "lucide-react";
import type { FormCondition, FormElement } from "@/lib/types";

const OPERATOR_LABELS: Record<FormCondition["operator"], string> = {
  equals: "igual a",
  not_equals: "diferente de",
  contains: "contém",
  not_contains: "não contém",
  greater_than: "maior que",
  less_than: "menor que",
  is_empty: "está vazio",
  is_not_empty: "não está vazio",
};

const NO_VALUE_OPERATORS: FormCondition["operator"][] = ["is_empty", "is_not_empty"];

interface ConditionEditorProps {
  element: FormElement;
}

export function ConditionEditor({ element }: ConditionEditorProps) {
  const schema = useBuilderStore((s) => s.schema);
  const updateElement = useBuilderStore((s) => s.updateElement);

  // Get all answerable fields BEFORE the current element (no forward references)
  const availableFields: FormElement[] = [];
  let found = false;
  for (const page of schema.pages) {
    for (const el of page.elements) {
      if (el.id === element.id) {
        found = true;
        break;
      }
      if (!["heading", "paragraph", "divider"].includes(el.type)) {
        availableFields.push(el);
      }
    }
    if (found) break;
  }

  const conditions = element.conditions || [];

  function updateConditions(newConditions: FormCondition[]) {
    updateElement(element.id, { conditions: newConditions });
  }

  function addCondition() {
    if (availableFields.length === 0) return;
    updateConditions([
      ...conditions,
      { field: availableFields[0].id, operator: "equals", value: "" },
    ]);
  }

  function removeCondition(index: number) {
    updateConditions(conditions.filter((_, i) => i !== index));
  }

  function updateCondition(index: number, updates: Partial<FormCondition>) {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], ...updates };
    // Clear value for operators that don't need it
    if (updates.operator && NO_VALUE_OPERATORS.includes(updates.operator)) {
      newConditions[index].value = undefined;
    }
    updateConditions(newConditions);
  }

  return (
    <div>
      {conditions.length === 0 && (
        <p className="text-[11px] text-muted/60 mb-2">
          Este campo será exibido sempre. Adicione uma condição para mostrá-lo apenas quando critérios forem atendidos.
        </p>
      )}

      <div className="space-y-2">
        {conditions.map((condition, index) => (
          <div key={index} className="rounded-lg border border-border bg-elevated p-2.5 space-y-2">
            {/* Source field */}
            <select
              value={condition.field}
              onChange={(e) => updateCondition(index, { field: e.target.value })}
              className="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-primary"
            >
              {availableFields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              {/* Operator */}
              <select
                value={condition.operator}
                onChange={(e) =>
                  updateCondition(index, {
                    operator: e.target.value as FormCondition["operator"],
                  })
                }
                className="flex-1 rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-primary"
              >
                {Object.entries(OPERATOR_LABELS).map(([op, label]) => (
                  <option key={op} value={op}>
                    {label}
                  </option>
                ))}
              </select>

              {/* Delete */}
              <button
                onClick={() => removeCondition(index)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted hover:bg-danger/10 hover:text-danger transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </div>

            {/* Value input (hidden for is_empty/is_not_empty) */}
            {!NO_VALUE_OPERATORS.includes(condition.operator) && (
              <Input
                value={String(condition.value ?? "")}
                onChange={(e) => updateCondition(index, { value: e.target.value })}
                placeholder="Valor"
                className="text-xs"
              />
            )}
          </div>
        ))}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="mt-2 w-full border border-dashed border-border hover:border-accent/30"
        onClick={addCondition}
        disabled={availableFields.length === 0}
      >
        <Plus size={12} />
        Adicionar condição
      </Button>

      {availableFields.length === 0 && conditions.length === 0 && (
        <p className="mt-1 text-[10px] text-muted/40">
          Adicione campos antes deste para criar condições
        </p>
      )}
    </div>
  );
}
