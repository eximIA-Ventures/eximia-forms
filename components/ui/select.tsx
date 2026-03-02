import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options: { label: string; value: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, placeholder, ...props }, ref) => (
    <div className="w-full">
      <select
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-lg border bg-elevated px-3 py-2 text-sm text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
          error ? "border-red-500" : "border-border",
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" className="bg-neutral-900 text-neutral-400">
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-neutral-900 text-neutral-100">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
);
Select.displayName = "Select";
