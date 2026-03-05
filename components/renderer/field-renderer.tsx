"use client";

import { useMemo } from "react";
import type { FormElement } from "@/lib/types";
import { useFormStore } from "@/stores/form-store";
import { Input, Textarea, Select } from "@/components/ui";
import { Star, Check } from "lucide-react";
import { MatrixField } from "./matrix-field";
import { RankingField } from "./ranking-field";
import { ConstantSumField } from "./constant-sum-field";
import { shuffle } from "@/lib/utils/shuffle";
import { cn } from "@/lib/utils";

interface FieldRendererProps {
  element: FormElement;
  questionNumber?: number;
  shuffleSeed?: string;
}

export function FieldRenderer({ element, questionNumber, shuffleSeed }: FieldRendererProps) {
  const answers = useFormStore((s) => s.answers);
  const errors = useFormStore((s) => s.errors);
  const setAnswer = useFormStore((s) => s.setAnswer);

  const value = answers[element.id];
  const error = errors[element.id];

  // Layout elements
  if (element.type === "heading") {
    return (
      <h2 className="text-xl font-semibold">
        {(element.properties.content as string) || element.label}
      </h2>
    );
  }
  if (element.type === "paragraph") {
    return (
      <p className="text-sm text-muted">
        {(element.properties.content as string) || element.label}
      </p>
    );
  }
  if (element.type === "divider") {
    return <hr className="border-border" />;
  }

  return (
    <div className="form-field-enter">
      <label className="mb-2 flex items-baseline gap-2 text-sm font-medium">
        {questionNumber && (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent/10 text-xs font-semibold text-accent">
            {questionNumber}
          </span>
        )}
        <span>
          {element.label}
          {element.required && <span className="ml-1 text-accent/60">*</span>}
        </span>
      </label>
      {element.description && (
        <p className="mb-3 text-xs text-muted">{element.description}</p>
      )}
      <FieldInput element={element} value={value} error={error} onChange={(v) => setAnswer(element.id, v)} shuffleSeed={shuffleSeed} />
    </div>
  );
}

interface FieldInputProps {
  element: FormElement;
  value: unknown;
  error?: string;
  onChange: (value: unknown) => void;
  shuffleSeed?: string;
}

function normalizeOptions(raw: unknown): { label: string; value: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt
  );
}

function FieldInput({ element, value, error, onChange, shuffleSeed }: FieldInputProps) {
  // Memoize shuffled options per element — use shuffleSeed + element.id for per-respondent randomization
  const shuffledOptions = useMemo(() => {
    const opts = normalizeOptions(element.properties.options);
    if (element.properties.shuffleOptions) {
      return shuffle(opts, (shuffleSeed || "") + element.id);
    }
    return opts;
  }, [element.properties.options, element.properties.shuffleOptions, element.id, shuffleSeed]);

  switch (element.type) {
    case "text":
    case "email":
    case "phone":
    case "url":
      return (
        <Input
          type={element.type === "phone" ? "tel" : element.type}
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={element.placeholder}
          error={error}
        />
      );

    case "number":
      return (
        <Input
          type="number"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")}
          placeholder={element.placeholder}
          error={error}
        />
      );

    case "textarea":
    case "richtext":
      return (
        <Textarea
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={element.placeholder}
          error={error}
          rows={4}
        />
      );

    case "select":
      return (
        <Select
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          options={shuffledOptions}
          placeholder="Selecione..."
          error={error}
        />
      );

    case "multiselect": {
      const selected = (value as string[]) || [];
      return (
        <div>
          <div className="grid gap-2 sm:grid-cols-2">
            {shuffledOptions.map((opt) => {
              const isSelected = selected.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      onChange(selected.filter((v) => v !== opt.value));
                    } else {
                      onChange([...selected, opt.value]);
                    }
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all",
                    isSelected
                      ? "form-option-selected text-primary font-medium"
                      : "border-border hover:border-accent/30 hover:bg-elevated text-muted"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all",
                      isSelected
                        ? "border-accent bg-accent"
                        : "border-border"
                    )}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} className="text-white" />}
                  </span>
                  {opt.label}
                </button>
              );
            })}
          </div>
          {error && <p className="mt-2 text-xs text-danger">{error}</p>}
        </div>
      );
    }

    case "checkbox":
      return (
        <button
          type="button"
          onClick={() => onChange(!value)}
          className={cn(
            "flex w-full items-center gap-3 cursor-pointer rounded-lg border px-4 py-3 text-left transition-all",
            value
              ? "form-option-selected"
              : "border-border hover:border-accent/30 hover:bg-elevated"
          )}
        >
          <span
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all",
              value
                ? "border-accent bg-accent"
                : "border-border"
            )}
          >
            {!!value && <Check size={12} strokeWidth={3} className="text-white" />}
          </span>
          <span className="text-sm">{element.label}</span>
          {error && <p className="text-xs text-danger ml-2">{error}</p>}
        </button>
      );

    case "radio": {
      return (
        <div>
          <div className="grid gap-2 sm:grid-cols-2">
            {shuffledOptions.map((opt) => {
              const isSelected = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange(opt.value)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all",
                    isSelected
                      ? "form-option-selected text-primary font-medium"
                      : "border-border hover:border-accent/30 hover:bg-elevated text-muted"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                      isSelected
                        ? "border-accent bg-accent"
                        : "border-border"
                    )}
                  >
                    {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                  </span>
                  {opt.label}
                </button>
              );
            })}
          </div>
          {error && <p className="mt-2 text-xs text-danger">{error}</p>}
        </div>
      );
    }

    case "date":
      return (
        <Input
          type="date"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          error={error}
        />
      );

    case "datetime":
      return (
        <Input
          type="datetime-local"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          error={error}
        />
      );

    case "time":
      return (
        <Input
          type="time"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          error={error}
        />
      );

    case "file":
    case "image":
      return (
        <div>
          <input
            type="file"
            accept={element.type === "image" ? "image/*" : (element.properties.accept as string) || "*/*"}
            onChange={(e) => onChange(e.target.files?.[0]?.name || "")}
            className="block w-full text-sm text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-accent/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-accent hover:file:bg-accent/20"
          />
          {error && <p className="mt-1 text-xs text-danger">{error}</p>}
        </div>
      );

    case "rating": {
      const max = (element.properties.max as number) || 5;
      const currentRating = (value as number) || 0;
      return (
        <div>
          <div className="flex gap-0.5">
            {Array.from({ length: max }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onChange(i + 1)}
                className="p-2 md:p-1.5 transition-colors"
              >
                <Star
                  size={28}
                  className={cn(
                    i < currentRating
                      ? "fill-accent text-accent"
                      : "text-border hover:text-accent/50"
                  )}
                />
              </button>
            ))}
          </div>
          {error && <p className="mt-1 text-xs text-danger">{error}</p>}
        </div>
      );
    }

    case "scale": {
      const min = (element.properties.min as number) ?? 1;
      const max = (element.properties.max as number) || 10;
      const step = (element.properties.step as number) || 1;
      const steps: number[] = [];
      for (let i = min; i <= max; i += step) steps.push(i);
      return (
        <div>
          <div className="flex flex-wrap gap-2">
            {steps.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => onChange(num)}
                className={cn(
                  "flex h-11 min-w-[2.75rem] items-center justify-center rounded-lg border px-3 text-sm transition-all",
                  value === num
                    ? "form-btn-accent border-accent text-white font-medium"
                    : "border-border hover:border-accent/50 hover:bg-elevated"
                )}
              >
                {num}
              </button>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted">
            <span>{(element.properties.minLabel as string) || `${min}`}</span>
            <span>{(element.properties.maxLabel as string) || `${max}`}</span>
          </div>
          {error && <p className="mt-1 text-xs text-danger">{error}</p>}
        </div>
      );
    }

    case "nps": {
      return (
        <div>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 11 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onChange(i)}
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-lg border text-sm transition-all",
                  value === i
                    ? "form-btn-accent border-accent text-white font-medium"
                    : "border-border hover:border-accent/50",
                  value !== i && i <= 6 && "hover:bg-danger/10",
                  value !== i && i >= 7 && i <= 8 && "hover:bg-warning/10",
                  value !== i && i >= 9 && "hover:bg-success/10"
                )}
              >
                {i}
              </button>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted">
            <span>Nada provável</span>
            <span>Extremamente provável</span>
          </div>
          {error && <p className="mt-1 text-xs text-danger">{error}</p>}
        </div>
      );
    }

    // ── New field types ──

    case "attention_check": {
      const displayType = (element.properties.displayType as string) || "radio";
      const opts = normalizeOptions(element.properties.options);
      if (displayType === "select") {
        return (
          <Select
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            options={opts}
            placeholder="Selecione..."
            error={error}
          />
        );
      }
      // Default: radio
      return (
        <div>
          <div className="grid gap-2 sm:grid-cols-2">
            {opts.map((opt) => {
              const isSelected = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange(opt.value)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all",
                    isSelected
                      ? "form-option-selected text-primary font-medium"
                      : "border-border hover:border-accent/30 hover:bg-elevated text-muted"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                      isSelected ? "border-accent bg-accent" : "border-border"
                    )}
                  >
                    {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                  </span>
                  {opt.label}
                </button>
              );
            })}
          </div>
          {error && <p className="mt-2 text-xs text-danger">{error}</p>}
        </div>
      );
    }

    case "matrix": {
      const rows = (element.properties.rows as string[]) || [];
      const columns = (element.properties.columns as string[]) || [];
      return (
        <MatrixField
          rows={rows}
          columns={columns}
          value={(value as Record<string, string>) || {}}
          onChange={onChange}
          error={error}
        />
      );
    }

    case "semantic_differential": {
      const leftLabel = (element.properties.leftLabel as string) || "";
      const rightLabel = (element.properties.rightLabel as string) || "";
      const points = (element.properties.points as number) || 5;
      return (
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted shrink-0 w-20 text-right sm:w-auto">{leftLabel}</span>
            <div className="flex flex-1 justify-center gap-2">
              {Array.from({ length: points }).map((_, i) => {
                const isSelected = value === i + 1;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onChange(i + 1)}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all",
                      isSelected
                        ? "border-accent bg-accent"
                        : "border-border hover:border-accent/50"
                    )}
                  >
                    {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
                  </button>
                );
              })}
            </div>
            <span className="text-xs text-muted shrink-0 w-20 sm:w-auto">{rightLabel}</span>
          </div>
          {error && <p className="mt-2 text-xs text-danger">{error}</p>}
        </div>
      );
    }

    case "word_association": {
      const terms = (element.properties.terms as string[]) || [];
      const termPlaceholder = (element.properties.termPlaceholder as string) || "Primeira palavra que vem à mente...";
      const currentValue = (value as Record<string, string>) || {};
      return (
        <div>
          <div className="space-y-2">
            {terms.map((term) => (
              <div key={term} className="flex items-center gap-3">
                <span className="min-w-[100px] text-sm font-medium">{term}</span>
                <Input
                  value={currentValue[term] || ""}
                  onChange={(e) => onChange({ ...currentValue, [term]: e.target.value })}
                  placeholder={termPlaceholder}
                  className="flex-1"
                />
              </div>
            ))}
          </div>
          {error && <p className="mt-2 text-xs text-danger">{error}</p>}
        </div>
      );
    }

    case "ranking": {
      const items = (element.properties.items as string[]) || [];
      return (
        <RankingField
          items={items}
          value={(value as string[]) || []}
          onChange={onChange}
          error={error}
        />
      );
    }

    case "constant_sum": {
      const items = (element.properties.items as string[]) || [];
      const total = (element.properties.total as number) || 100;
      const unit = (element.properties.unit as string) || "pontos";
      return (
        <ConstantSumField
          items={items}
          total={total}
          unit={unit}
          value={(value as Record<string, number>) || {}}
          onChange={onChange}
          error={error}
        />
      );
    }

    default:
      return (
        <Input
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={element.placeholder}
          error={error}
        />
      );
  }
}
