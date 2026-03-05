"use client";

import { useState } from "react";
import { useBuilderStore } from "@/stores/builder-store";
import { Button } from "@/components/ui";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  X,
  ArrowDown,
  Shuffle,
  Link2,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Warning {
  severity: "high" | "medium" | "low";
  description: string;
  affectedFields: string[];
  suggestion: string;
  type: "funnel" | "correlation" | "randomization" | "sensitivity";
}

const TYPE_ICONS: Record<Warning["type"], React.ComponentType<{ size?: number; className?: string }>> = {
  funnel: ArrowDown,
  correlation: Link2,
  randomization: Shuffle,
  sensitivity: ShieldAlert,
};

const TYPE_LABELS: Record<Warning["type"], string> = {
  funnel: "Técnica de Funil",
  correlation: "Correlação",
  randomization: "Randomização",
  sensitivity: "Sensibilidade",
};

const SEVERITY_STYLES: Record<Warning["severity"], string> = {
  high: "border-red-500/30 bg-red-500/10 text-red-400",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  low: "border-blue-500/30 bg-blue-500/10 text-blue-400",
};

const SEVERITY_LABELS: Record<Warning["severity"], string> = {
  high: "Alto",
  medium: "Médio",
  low: "Baixo",
};

interface OrderBiasAnalyzerProps {
  onClose: () => void;
}

export function OrderBiasAnalyzer({ onClose }: OrderBiasAnalyzerProps) {
  const schema = useBuilderStore((s) => s.schema);
  const selectElement = useBuilderStore((s) => s.selectElement);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyze() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/order-bias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schema }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro na análise");
      }
      const data = await res.json();
      setWarnings(data.warnings || []);
      setAnalyzed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao analisar");
    } finally {
      setLoading(false);
    }
  }

  function getFieldLabel(fieldId: string): string {
    for (const page of schema.pages) {
      const el = page.elements.find((e) => e.id === fieldId);
      if (el) return el.label;
    }
    return fieldId;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-3">
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-accent" />
          <span className="text-xs font-semibold">Análise de Viés de Ordem</span>
        </div>
        <button
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted hover:bg-elevated hover:text-primary transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {!analyzed && !loading && (
          <div className="text-center py-6 space-y-3">
            <AlertTriangle size={32} className="mx-auto text-muted/30" />
            <p className="text-xs text-muted">
              Analise a ordem das questões para identificar potenciais vieses
              de ordem que podem afetar os resultados da pesquisa.
            </p>
            <Button onClick={analyze} size="sm" className="mx-auto">
              Analisar Ordem
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Loader2 size={24} className="animate-spin text-accent" />
            <p className="text-xs text-muted">Analisando viés de ordem...</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        {analyzed && !loading && warnings.length === 0 && (
          <div className="text-center py-6 space-y-2">
            <CheckCircle2 size={32} className="mx-auto text-emerald-400" />
            <p className="text-sm font-medium text-emerald-400">Nenhum problema encontrado</p>
            <p className="text-xs text-muted">A ordem das questões parece adequada.</p>
          </div>
        )}

        {analyzed && warnings.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                {warnings.length} problema{warnings.length > 1 ? "s" : ""} encontrado{warnings.length > 1 ? "s" : ""}
              </span>
              <Button onClick={analyze} variant="ghost" size="sm" className="h-6 text-[10px]">
                Re-analisar
              </Button>
            </div>

            {warnings.map((warning, i) => {
              const Icon = TYPE_ICONS[warning.type];
              return (
                <div
                  key={i}
                  className={cn(
                    "rounded-lg border p-3 space-y-2",
                    SEVERITY_STYLES[warning.severity]
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Icon size={12} />
                      <span className="text-[10px] font-semibold uppercase">
                        {TYPE_LABELS[warning.type]}
                      </span>
                    </div>
                    <span className={cn(
                      "rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase",
                      warning.severity === "high" && "bg-red-500/20",
                      warning.severity === "medium" && "bg-amber-500/20",
                      warning.severity === "low" && "bg-blue-500/20",
                    )}>
                      {SEVERITY_LABELS[warning.severity]}
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed">{warning.description}</p>

                  {warning.affectedFields.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {warning.affectedFields.map((fieldId) => (
                        <button
                          key={fieldId}
                          onClick={() => selectElement(fieldId)}
                          className="rounded bg-black/20 px-1.5 py-0.5 text-[10px] hover:bg-black/30 transition-colors cursor-pointer"
                        >
                          {getFieldLabel(fieldId)}
                        </button>
                      ))}
                    </div>
                  )}

                  <p className="text-[11px] opacity-80 italic">
                    Sugestão: {warning.suggestion}
                  </p>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
