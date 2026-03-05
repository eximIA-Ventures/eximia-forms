"use client";

import { cn } from "@/lib/utils";

interface MatrixFieldProps {
  rows: string[];
  columns: string[];
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  error?: string;
}

export function MatrixField({ rows, columns, value, onChange, error }: MatrixFieldProps) {
  function handleSelect(row: string, col: string) {
    onChange({ ...value, [row]: col });
  }

  return (
    <div>
      {/* Desktop: table layout */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="pb-3 text-left text-xs font-medium text-muted" />
              {columns.map((col) => (
                <th key={col} className="pb-3 text-center text-xs font-medium text-muted px-2">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row} className="border-t border-border/30">
                <td className="py-3 pr-4 text-sm">{row}</td>
                {columns.map((col) => {
                  const isSelected = value[row] === col;
                  return (
                    <td key={col} className="py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleSelect(row, col)}
                        className={cn(
                          "mx-auto flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
                          isSelected
                            ? "border-accent bg-accent"
                            : "border-border hover:border-accent/50"
                        )}
                      >
                        {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: card layout */}
      <div className="sm:hidden space-y-4">
        {rows.map((row) => (
          <div key={row} className="rounded-lg border border-border p-3">
            <p className="mb-2 text-sm font-medium">{row}</p>
            <div className="flex flex-wrap gap-1.5">
              {columns.map((col) => {
                const isSelected = value[row] === col;
                return (
                  <button
                    key={col}
                    type="button"
                    onClick={() => handleSelect(row, col)}
                    className={cn(
                      "rounded-lg border px-2.5 py-1.5 text-xs transition-all",
                      isSelected
                        ? "form-option-selected text-primary font-medium"
                        : "border-border hover:border-accent/30 text-muted"
                    )}
                  >
                    {col}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}
