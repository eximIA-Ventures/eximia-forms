"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import {
  Sparkles,
  Loader2,
  Replace,
  PlusCircle,
  ChevronDown,
  ChevronUp,
  ClipboardPaste,
} from "lucide-react";
import { useBuilderStore } from "@/stores/builder-store";
import type { FormSchema } from "@/lib/types";
import { cn } from "@/lib/utils";

type AiMode = "generate" | "import";

export function AiGenerator() {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [aiMode, setAiMode] = useState<AiMode>("generate");
  const setSchema = useBuilderStore((s) => s.setSchema);
  const schema = useBuilderStore((s) => s.schema);
  const appendElements = useBuilderStore((s) => s.appendElements);
  const toast = useToast();

  const hasExistingFields = schema.pages.some((p) => p.elements.length > 0);

  async function handleGenerate(action: "replace" | "append") {
    if (!prompt.trim()) return;
    setGenerating(true);

    try {
      const body: Record<string, unknown> = { prompt, mode: aiMode };
      if (action === "append") {
        const existingLabels = schema.pages
          .flatMap((p) => p.elements)
          .map((el) => el.label);
        body.existingFields = existingLabels;
      }

      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast.error(err?.error || "Erro ao gerar formulário");
        return;
      }

      const { schema: aiSchema } = (await res.json()) as {
        schema: FormSchema;
      };

      if (action === "replace") {
        setSchema(aiSchema);
        useBuilderStore.setState({ isDirty: true });
        toast.success(
          aiMode === "import"
            ? "Perguntas importadas com sucesso!"
            : "Formulário gerado com IA!"
        );
      } else {
        const newElements = aiSchema.pages.flatMap((p) => p.elements);
        appendElements(newElements);
        toast.success(`${newElements.length} campos adicionados!`);
      }

      setPrompt("");
      setExpanded(false);
    } catch {
      toast.error("Erro de conexão");
    } finally {
      setGenerating(false);
    }
  }

  const placeholder =
    aiMode === "import"
      ? "Cole suas perguntas aqui, uma por linha:\n\n1. Qual seu nome completo?\n2. Qual seu email?\n3. De 0 a 10, qual a probabilidade de recomendar?\n..."
      : "Ex: Formulário de qualificação de leads com nome, email, empresa, orçamento...";

  const actionLabel =
    aiMode === "import"
      ? generating
        ? "Importando..."
        : hasExistingFields
          ? "Substituir"
          : "Importar"
      : generating
        ? "Gerando..."
        : hasExistingFields
          ? "Substituir"
          : "Gerar";

  return (
    <div className="rounded-xl border border-accent/20 bg-accent/5 overflow-hidden">
      {/* Collapsed header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-accent" />
          <span className="text-xs font-semibold text-accent">IA</span>
        </div>
        {expanded ? (
          <ChevronUp size={12} className="text-muted" />
        ) : (
          <ChevronDown size={12} className="text-muted" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          {/* Mode tabs */}
          <div className="flex rounded-lg bg-elevated p-0.5">
            <button
              onClick={() => setAiMode("generate")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-medium transition-all",
                aiMode === "generate"
                  ? "bg-surface text-primary shadow-sm"
                  : "text-muted hover:text-primary"
              )}
            >
              <Sparkles size={11} />
              Descrever
            </button>
            <button
              onClick={() => setAiMode("import")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-medium transition-all",
                aiMode === "import"
                  ? "bg-surface text-primary shadow-sm"
                  : "text-muted hover:text-primary"
              )}
            >
              <ClipboardPaste size={11} />
              Importar
            </button>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholder}
            rows={aiMode === "import" ? 6 : 3}
            className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-xs text-primary placeholder:text-muted/50 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/20 resize-none transition-colors"
          />

          <div
            className={cn(
              "grid gap-1.5",
              hasExistingFields ? "grid-cols-2" : "grid-cols-1"
            )}
          >
            {/* Replace / Generate / Import */}
            <button
              onClick={() => handleGenerate("replace")}
              disabled={generating || !prompt.trim()}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-medium transition-all",
                "bg-accent text-white hover:bg-accent/90",
                "disabled:opacity-40 disabled:pointer-events-none"
              )}
            >
              {generating ? (
                <Loader2 size={12} className="animate-spin" />
              ) : aiMode === "import" ? (
                <ClipboardPaste size={12} />
              ) : hasExistingFields ? (
                <Replace size={12} />
              ) : (
                <Sparkles size={12} />
              )}
              {actionLabel}
            </button>

            {/* Append */}
            {hasExistingFields && (
              <button
                onClick={() => handleGenerate("append")}
                disabled={generating || !prompt.trim()}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg border border-accent/30 px-3 py-2 text-[11px] font-medium text-accent transition-all",
                  "hover:bg-accent/5",
                  "disabled:opacity-40 disabled:pointer-events-none"
                )}
              >
                <PlusCircle size={12} />
                Adicionar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
