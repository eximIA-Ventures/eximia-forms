"use client";

import { useState } from "react";
import { useBuilderStore } from "@/stores/builder-store";
import { useToast } from "@/components/ui/toast";
import {
  X,
  Check,
  XCircle,
  MessageSquare,
  Plus,
  Pencil,
  Minus,
  Loader2,
  Send,
} from "lucide-react";
import { Button, Textarea } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { SchemaDiff } from "@/lib/ai/types";
import type { FormSchema } from "@/lib/types";

interface AiPreviewModalProps {
  isOpen: boolean;
  diff: SchemaDiff | null;
  proposed: FormSchema | null;
  mode: "replace" | "append";
  onApprove: () => void;
  onReject: () => void;
  onRefine: (refinement: string) => void;
  refining: boolean;
}

export function AiPreviewModal({
  isOpen,
  diff,
  proposed,
  mode,
  onApprove,
  onReject,
  onRefine,
  refining,
}: AiPreviewModalProps) {
  const [showRefine, setShowRefine] = useState(false);
  const [refinement, setRefinement] = useState("");

  if (!isOpen || !diff) return null;

  const totalAdded = diff.added.length;
  const totalModified = diff.modified.length;
  const totalRemoved = diff.removed.length;

  function handleRefine() {
    if (!refinement.trim()) return;
    onRefine(refinement.trim());
    setRefinement("");
    setShowRefine(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onReject}
      />

      {/* Modal */}
      <div className="relative z-10 mx-4 flex max-h-[85vh] w-full max-w-xl flex-col rounded-2xl border border-border bg-surface shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <h2 className="text-lg font-semibold">Preview de alterações da IA</h2>
            <div className="mt-1 flex gap-2">
              {totalAdded > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                  <Plus size={10} />
                  {totalAdded} novo{totalAdded > 1 ? "s" : ""}
                </span>
              )}
              {totalModified > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400">
                  <Pencil size={10} />
                  {totalModified} modificado{totalModified > 1 ? "s" : ""}
                </span>
              )}
              {totalRemoved > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-medium text-red-400">
                  <Minus size={10} />
                  {totalRemoved} removido{totalRemoved > 1 ? "s" : ""}
                </span>
              )}
              {totalAdded === 0 && totalModified === 0 && totalRemoved === 0 && (
                <span className="text-[11px] text-muted">Nenhuma alteração detectada</span>
              )}
            </div>
          </div>
          <button
            onClick={onReject}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-elevated hover:text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Added */}
          {diff.added.length > 0 && (
            <DiffSection title="Novos campos" color="emerald">
              {diff.added.map((d, i) => (
                <DiffCard key={i} className="border-emerald-500/20 bg-emerald-500/5">
                  <div className="flex items-center gap-2">
                    <Plus size={12} className="text-emerald-400" />
                    <span className="text-sm font-medium">{d.element.label}</span>
                    <span className="rounded bg-elevated px-1.5 py-0.5 text-[10px] text-muted">
                      {d.element.type}
                    </span>
                  </div>
                  {d.element.description && (
                    <p className="mt-1 text-xs text-muted">{d.element.description}</p>
                  )}
                </DiffCard>
              ))}
            </DiffSection>
          )}

          {/* Modified */}
          {diff.modified.length > 0 && (
            <DiffSection title="Campos modificados" color="amber">
              {diff.modified.map((d, i) => (
                <DiffCard key={i} className="border-amber-500/20 bg-amber-500/5">
                  <div className="flex items-center gap-2">
                    <Pencil size={12} className="text-amber-400" />
                    <span className="text-sm font-medium">{d.element.label}</span>
                  </div>
                  {d.changedKeys && d.changedKeys.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {d.changedKeys.map((key) => (
                        <div key={key} className="flex items-center gap-2 text-xs">
                          <span className="text-muted">{key}:</span>
                          {d.before && (
                            <span className="line-through text-red-400/70">
                              {formatValue(key, d.before as unknown as Record<string, unknown>)}
                            </span>
                          )}
                          <span className="text-emerald-400">
                            {formatValue(key, d.element as unknown as Record<string, unknown>)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </DiffCard>
              ))}
            </DiffSection>
          )}

          {/* Removed */}
          {diff.removed.length > 0 && (
            <DiffSection title="Campos removidos" color="red">
              {diff.removed.map((d, i) => (
                <DiffCard key={i} className="border-red-500/20 bg-red-500/5">
                  <div className="flex items-center gap-2">
                    <Minus size={12} className="text-red-400" />
                    <span className="text-sm font-medium line-through text-muted">
                      {d.element.label}
                    </span>
                    <span className="rounded bg-elevated px-1.5 py-0.5 text-[10px] text-muted">
                      {d.element.type}
                    </span>
                  </div>
                </DiffCard>
              ))}
            </DiffSection>
          )}

          {/* Refine section */}
          {showRefine && (
            <div className="space-y-2 rounded-xl border border-accent/20 bg-accent/5 p-4">
              <label className="text-xs font-medium text-accent">Instrução de ajuste</label>
              <Textarea
                value={refinement}
                onChange={(e) => setRefinement(e.target.value)}
                placeholder="Ex: Adicione um campo de CPF depois do email..."
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowRefine(false);
                    setRefinement("");
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleRefine}
                  disabled={!refinement.trim() || refining}
                  className="gap-1.5"
                >
                  {refining ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Send size={12} />
                  )}
                  Enviar ajuste
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border p-5">
          <Button
            variant="ghost"
            onClick={() => setShowRefine(!showRefine)}
            className="gap-1.5 text-accent"
          >
            <MessageSquare size={14} />
            Ajustar
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onReject} className="gap-1.5">
              <XCircle size={14} />
              Rejeitar
            </Button>
            <Button onClick={onApprove} className="gap-1.5">
              <Check size={14} />
              Aprovar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DiffSection({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function DiffCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-lg border p-3", className)}>{children}</div>
  );
}

function formatValue(key: string, element: Record<string, unknown>): string {
  const val = element[key];
  if (val === undefined || val === null) return "—";
  if (typeof val === "boolean") return val ? "sim" : "não";
  if (typeof val === "object") return JSON.stringify(val).slice(0, 50);
  return String(val).slice(0, 50);
}
