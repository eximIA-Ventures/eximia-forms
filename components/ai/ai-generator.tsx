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
  Pencil,
} from "lucide-react";
import { useBuilderStore } from "@/stores/builder-store";
import { AiPreviewModal } from "./ai-preview-modal";
import { computeSchemaDiff } from "@/lib/ai/schema-diff";
import type { FormSchema } from "@/lib/types";
import type { SchemaDiff, DiffMode } from "@/lib/ai/types";
import { cn } from "@/lib/utils";

type AiMode = "generate" | "import" | "edit";

export function AiGenerator() {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [aiMode, setAiMode] = useState<AiMode>("generate");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [category, setCategory] = useState("");
  const [tone, setTone] = useState("");
  const [length, setLength] = useState("");
  const [audience, setAudience] = useState("");
  const [multiplePages, setMultiplePages] = useState<"auto" | "yes" | "no">("auto");
  const setSchema = useBuilderStore((s) => s.setSchema);
  const schema = useBuilderStore((s) => s.schema);
  const appendElements = useBuilderStore((s) => s.appendElements);
  const toast = useToast();

  // Preview modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDiff, setPreviewDiff] = useState<SchemaDiff | null>(null);
  const [proposedSchema, setProposedSchema] = useState<FormSchema | null>(null);
  const [previewMode, setPreviewMode] = useState<DiffMode>("replace");
  const [refining, setRefining] = useState(false);

  const hasExistingFields = schema.pages.some((p) => p.elements.length > 0);

  async function handleGenerate(action: "replace" | "append") {
    if (!prompt.trim()) return;
    setGenerating(true);

    try {
      let aiSchema: FormSchema;

      if (aiMode === "edit") {
        // Use the edit endpoint
        const res = await fetch("/api/ai/edit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ instruction: prompt, currentSchema: schema }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          toast.error(err?.error || "Erro ao editar formulário");
          return;
        }
        const data = await res.json();
        aiSchema = data.schema;
      } else {
        // Use the generate endpoint
        const body: Record<string, unknown> = { prompt, mode: aiMode };
        if (category) body.category = category;
        if (tone) body.tone = tone;
        if (length) body.length = length;
        if (audience.trim()) body.audience = audience.trim();
        if (multiplePages === "yes") body.multiplePages = true;
        else if (multiplePages === "no") body.multiplePages = false;
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
        const data = await res.json();
        aiSchema = data.schema;
      }

      // Compute diff and open preview modal
      const diffMode: DiffMode = action === "append" ? "append" : "replace";
      const diff = computeSchemaDiff(schema, aiSchema, diffMode);
      setProposedSchema(aiSchema);
      setPreviewDiff(diff);
      setPreviewMode(diffMode);
      setPreviewOpen(true);
    } catch {
      toast.error("Erro de conexão");
    } finally {
      setGenerating(false);
    }
  }

  function handleApprove() {
    if (!proposedSchema) return;

    if (previewMode === "append") {
      const newElements = proposedSchema.pages.flatMap((p) => p.elements);
      appendElements(newElements);
      toast.success(`${newElements.length} campos adicionados!`);
    } else {
      setSchema(proposedSchema);
      useBuilderStore.setState({ isDirty: true });
      toast.success(
        aiMode === "import"
          ? "Perguntas importadas com sucesso!"
          : aiMode === "edit"
            ? "Alterações aplicadas!"
            : "Formulário gerado com IA!"
      );
    }

    setPreviewOpen(false);
    setProposedSchema(null);
    setPreviewDiff(null);
    setPrompt("");
    setExpanded(false);
  }

  function handleReject() {
    setPreviewOpen(false);
    setProposedSchema(null);
    setPreviewDiff(null);
    toast.success("Alterações descartadas");
  }

  async function handleRefine(refinement: string) {
    if (!proposedSchema) return;
    setRefining(true);

    try {
      const res = await fetch("/api/ai/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instruction: refinement,
          currentSchema: proposedSchema,
        }),
      });

      if (!res.ok) {
        toast.error("Erro ao refinar");
        return;
      }

      const data = await res.json();
      const newDiff = computeSchemaDiff(schema, data.schema, previewMode);
      setProposedSchema(data.schema);
      setPreviewDiff(newDiff);
      toast.success("Preview atualizado");
    } catch {
      toast.error("Erro de conexão");
    } finally {
      setRefining(false);
    }
  }

  const placeholder =
    aiMode === "import"
      ? "Cole suas perguntas aqui, uma por linha:\n\n1. Qual seu nome completo?\n2. Qual seu email?\n3. De 0 a 10, qual a probabilidade de recomendar?\n..."
      : aiMode === "edit"
        ? "Ex: Adicione um campo de CPF depois do email..."
        : "Ex: Formulário de qualificação de leads com nome, email, empresa, orçamento...";

  const actionLabel =
    aiMode === "import"
      ? generating ? "Importando..." : hasExistingFields ? "Substituir" : "Importar"
      : aiMode === "edit"
        ? generating ? "Editando..." : "Aplicar edição"
        : generating
          ? "Gerando..."
          : hasExistingFields ? "Substituir" : "Gerar";

  return (
    <>
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
              <button
                onClick={() => setAiMode("edit")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-medium transition-all",
                  aiMode === "edit"
                    ? "bg-surface text-primary shadow-sm"
                    : "text-muted hover:text-primary"
                )}
              >
                <Pencil size={11} />
                Editar
              </button>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={placeholder}
              rows={aiMode === "import" ? 6 : 3}
              className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-xs text-primary placeholder:text-muted/50 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/20 resize-none transition-colors"
            />

            {/* Advanced options — only for generate mode */}
            {aiMode === "generate" && (
              <div>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-1 text-[10px] text-muted hover:text-primary transition-colors"
                >
                  {showAdvanced ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                  Opções avançadas
                </button>
                {showAdvanced && (
                  <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="rounded-md border border-border bg-elevated px-2 py-1.5 text-[11px] text-primary focus:border-accent/50 focus:outline-none"
                    >
                      <option value="">Categoria...</option>
                      <option value="survey">Pesquisa</option>
                      <option value="lead_gen">Captação de leads</option>
                      <option value="feedback">Feedback</option>
                      <option value="registration">Cadastro</option>
                      <option value="quiz">Quiz</option>
                      <option value="event">Evento</option>
                      <option value="order">Pedido</option>
                      <option value="nps">NPS</option>
                    </select>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="rounded-md border border-border bg-elevated px-2 py-1.5 text-[11px] text-primary focus:border-accent/50 focus:outline-none"
                    >
                      <option value="">Tom...</option>
                      <option value="formal">Formal</option>
                      <option value="friendly">Amigável</option>
                      <option value="casual">Casual</option>
                      <option value="professional">Profissional</option>
                    </select>
                    <select
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      className="rounded-md border border-border bg-elevated px-2 py-1.5 text-[11px] text-primary focus:border-accent/50 focus:outline-none"
                    >
                      <option value="">Tamanho...</option>
                      <option value="short">Curto (1-5)</option>
                      <option value="medium">Médio (6-15)</option>
                      <option value="long">Longo (16+)</option>
                    </select>
                    <select
                      value={multiplePages}
                      onChange={(e) => setMultiplePages(e.target.value as "auto" | "yes" | "no")}
                      className="rounded-md border border-border bg-elevated px-2 py-1.5 text-[11px] text-primary focus:border-accent/50 focus:outline-none"
                    >
                      <option value="auto">Páginas: auto</option>
                      <option value="yes">Múltiplas páginas</option>
                      <option value="no">Página única</option>
                    </select>
                    <input
                      type="text"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      placeholder="Público-alvo..."
                      className="col-span-2 rounded-md border border-border bg-elevated px-2 py-1.5 text-[11px] text-primary placeholder:text-muted/50 focus:border-accent/50 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            <div
              className={cn(
                "grid gap-1.5",
                hasExistingFields && aiMode !== "edit" ? "grid-cols-2" : "grid-cols-1"
              )}
            >
              {/* Replace / Generate / Import / Edit */}
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
                ) : aiMode === "edit" ? (
                  <Pencil size={12} />
                ) : hasExistingFields ? (
                  <Replace size={12} />
                ) : (
                  <Sparkles size={12} />
                )}
                {actionLabel}
              </button>

              {/* Append */}
              {hasExistingFields && aiMode !== "edit" && (
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

      {/* Preview Modal */}
      <AiPreviewModal
        isOpen={previewOpen}
        diff={previewDiff}
        proposed={proposedSchema}
        mode={previewMode}
        onApprove={handleApprove}
        onReject={handleReject}
        onRefine={handleRefine}
        refining={refining}
      />
    </>
  );
}
