"use client";

import { cn } from "@/lib/utils";

interface ConstantSumFieldProps {
  items: string[];
  total: number;
  unit: string;
  value: Record<string, number>;
  onChange: (value: Record<string, number>) => void;
  error?: string;
}

export function ConstantSumField({
  items,
  total,
  unit,
  value,
  onChange,
  error,
}: ConstantSumFieldProps) {
  const currentSum = Object.values(value).reduce((a, b) => a + (b || 0), 0);
  const remaining = total - currentSum;
  const isOver = remaining < 0;
  const isExact = remaining === 0;

  function handleChange(item: string, num: number) {
    onChange({ ...value, [item]: num });
  }

  const progressPercent = Math.min((currentSum / total) * 100, 100);

  return (
    <div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-3">
            <span className="flex-1 text-sm">{item}</span>
            <div className="relative w-24">
              <input
                type="number"
                min={0}
                max={total}
                value={value[item] ?? ""}
                onChange={(e) => handleChange(item, parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-right text-primary focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/20"
              />
              <span className="absolute right-9 top-1/2 -translate-y-1/2 text-[10px] text-muted">
                {unit === "%" ? "%" : ""}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="h-2 w-full rounded-full bg-elevated overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              isOver ? "bg-danger" : isExact ? "bg-emerald-500" : "bg-accent"
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p
          className={cn(
            "mt-1.5 text-xs font-medium",
            isOver ? "text-danger" : isExact ? "text-emerald-400" : "text-muted"
          )}
        >
          {isExact
            ? `Total: ${total} ${unit}`
            : isOver
              ? `Excedeu em ${Math.abs(remaining)} ${unit}`
              : `Restam ${remaining} ${unit}`}
        </p>
      </div>

      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}
