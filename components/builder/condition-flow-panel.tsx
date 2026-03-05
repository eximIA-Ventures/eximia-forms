"use client";

import { useBuilderStore } from "@/stores/builder-store";
import { GitBranch, Eye, EyeOff, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FormCondition } from "@/lib/types/form";

function getFieldLabelById(
  pages: { elements: { id: string; label: string; type: string }[] }[],
  fieldId: string
): string {
  for (const page of pages) {
    const el = page.elements.find((e) => e.id === fieldId);
    if (el) return el.label;
  }
  return fieldId;
}

function formatCondition(
  condition: FormCondition,
  pages: { elements: { id: string; label: string; type: string }[] }[]
): string {
  const fieldLabel = getFieldLabelById(pages, condition.field);
  const operators: Record<string, string> = {
    equals: "=",
    not_equals: "≠",
    contains: "contém",
    not_contains: "não contém",
    greater_than: ">",
    less_than: "<",
    is_empty: "está vazio",
    is_not_empty: "não está vazio",
  };
  const op = operators[condition.operator] || condition.operator;
  if (condition.operator === "is_empty" || condition.operator === "is_not_empty") {
    return `${fieldLabel} ${op}`;
  }
  return `${fieldLabel} ${op} "${condition.value}"`;
}

export function ConditionFlowPanel() {
  const schema = useBuilderStore((s) => s.schema);
  const selectElement = useBuilderStore((s) => s.selectElement);
  const selectPage = useBuilderStore((s) => s.selectPage);

  const layoutTypes = ["heading", "paragraph", "divider"];

  // Count total conditions
  let totalConditions = 0;
  let conditionalPages = 0;
  for (const page of schema.pages) {
    if (page.conditions && page.conditions.length > 0) conditionalPages++;
    for (const el of page.elements) {
      if (el.conditions && el.conditions.length > 0) totalConditions++;
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border p-3">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
          <GitBranch size={12} />
          Fluxo de Condições
        </div>
        <p className="mt-1 text-[10px] text-muted/60">
          {totalConditions === 0 && conditionalPages === 0
            ? "Nenhuma condição definida"
            : `${totalConditions} campo${totalConditions !== 1 ? "s" : ""} condicional${totalConditions !== 1 ? "is" : ""} · ${conditionalPages} página${conditionalPages !== 1 ? "s" : ""} condicional${conditionalPages !== 1 ? "is" : ""}`}
        </p>
      </div>

      {/* Flow */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {schema.pages.map((page, pageIndex) => {
          const hasPageConditions = page.conditions && page.conditions.length > 0;

          return (
            <div key={page.id} className="rounded-lg border border-border overflow-hidden">
              {/* Page header */}
              <button
                onClick={() => selectPage(pageIndex)}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-elevated",
                  hasPageConditions && "bg-amber-500/5"
                )}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded bg-accent/10 text-[9px] font-bold text-accent">
                  {pageIndex + 1}
                </span>
                <span className="flex-1 text-xs font-medium truncate">
                  {page.title || `Página ${pageIndex + 1}`}
                </span>
                {hasPageConditions && (
                  <span className="flex items-center gap-0.5 text-[9px] text-amber-400">
                    <GitBranch size={8} />
                  </span>
                )}
              </button>

              {/* Page conditions */}
              {hasPageConditions && (
                <div className="border-t border-border/50 bg-amber-500/5 px-3 py-1.5">
                  {page.conditions.map((cond, ci) => (
                    <div key={ci} className="flex items-center gap-1.5 text-[10px] text-amber-400">
                      <ChevronRight size={8} />
                      <span>Se {formatCondition(cond, schema.pages)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Elements */}
              <div className="border-t border-border/30">
                {page.elements.map((element) => {
                  const isLayout = layoutTypes.includes(element.type);
                  const hasConditions = element.conditions && element.conditions.length > 0;

                  return (
                    <button
                      key={element.id}
                      onClick={() => {
                        selectPage(pageIndex);
                        selectElement(element.id);
                      }}
                      className={cn(
                        "flex w-full items-start gap-2 px-3 py-1.5 text-left transition-colors hover:bg-elevated/50 border-b border-border/20 last:border-b-0",
                        isLayout && "opacity-50"
                      )}
                    >
                      {hasConditions ? (
                        <EyeOff size={10} className="mt-0.5 shrink-0 text-amber-400" />
                      ) : (
                        <Eye size={10} className="mt-0.5 shrink-0 text-muted/30" />
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] text-primary truncate block">
                          {element.label}
                        </span>
                        {hasConditions ? (
                          <div className="mt-0.5 space-y-0.5">
                            {element.conditions.map((cond, ci) => (
                              <div key={ci} className="flex items-center gap-1 text-[9px] text-amber-400/80">
                                <ChevronRight size={7} />
                                <span className="truncate">Se {formatCondition(cond, schema.pages)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[9px] text-muted/40">Sempre visível</span>
                        )}
                      </div>
                    </button>
                  );
                })}

                {page.elements.length === 0 && (
                  <div className="px-3 py-2 text-[10px] text-muted/40 italic">
                    Página vazia
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
