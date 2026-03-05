"use client";

import type { FormElement, FormSubmission } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, BarChart3 } from "lucide-react";

const LAYOUT_TYPES = ["heading", "paragraph", "divider"];

interface FieldResponseRatesProps {
  fields: FormElement[];
  submissions: FormSubmission[];
}

export function FieldResponseRates({
  fields,
  submissions,
}: FieldResponseRatesProps) {
  if (submissions.length === 0) return null;

  const answerableFields = fields.filter(
    (f) => !LAYOUT_TYPES.includes(f.type)
  );

  const rates = answerableFields.map((field) => {
    const answered = submissions.filter((s) => {
      const val = s.data[field.id];
      if (val === undefined || val === null) return false;
      if (typeof val === "string" && val.trim() === "") return false;
      if (Array.isArray(val) && val.length === 0) return false;
      return true;
    }).length;

    const rate = submissions.length > 0 ? answered / submissions.length : 0;

    return {
      field,
      answered,
      total: submissions.length,
      rate,
    };
  });

  // Sort by rate ascending (worst first)
  const sorted = [...rates].sort((a, b) => a.rate - b.rate);

  const avgRate =
    rates.length > 0
      ? rates.reduce((sum, r) => sum + r.rate, 0) / rates.length
      : 0;

  const problematicCount = rates.filter((r) => r.rate < 0.7).length;

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Taxa de Resposta por Campo</h3>
          <p className="text-xs text-muted">
            {answerableFields.length} campos · média{" "}
            {Math.round(avgRate * 100)}%
          </p>
        </div>
        <div className="rounded-lg bg-accent-alt/10 p-2">
          <BarChart3 size={14} className="text-accent-alt" />
        </div>
      </div>

      {problematicCount > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-warning/5 border border-warning/20 px-3 py-2">
          <AlertTriangle size={14} className="shrink-0 text-warning" />
          <p className="text-xs text-warning">
            {problematicCount} campo{problematicCount !== 1 ? "s" : ""} com taxa
            abaixo de 70% — considere revisar a formulação
          </p>
        </div>
      )}

      <div className="space-y-2.5">
        {sorted.map(({ field, answered, total, rate }) => {
          const pct = Math.round(rate * 100);
          const isLow = rate < 0.7;
          const isPerfect = rate === 1;

          return (
            <div key={field.id}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 truncate pr-2">
                  {isLow && (
                    <AlertTriangle size={10} className="shrink-0 text-warning" />
                  )}
                  {isPerfect && (
                    <CheckCircle2 size={10} className="shrink-0 text-success" />
                  )}
                  <span className="font-medium truncate">{field.label}</span>
                  {field.required && (
                    <span className="shrink-0 text-[9px] text-accent">*</span>
                  )}
                </span>
                <span
                  className={cn(
                    "shrink-0 tabular-nums",
                    isLow ? "text-warning" : "text-muted"
                  )}
                >
                  {answered}/{total} ({pct}%)
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-elevated">
                <div
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    isLow
                      ? "bg-warning"
                      : isPerfect
                      ? "bg-success"
                      : "bg-accent-alt"
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
