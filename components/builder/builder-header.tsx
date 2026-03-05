"use client";

import { useBuilderStore } from "@/stores/builder-store";
import { Button } from "@/components/ui";
import {
  ArrowLeft,
  Save,
  Eye,
  Undo2,
  Redo2,
  ExternalLink,
  CheckCircle2,
  Loader2,
  Globe,
  GlobeLock,
  Copy,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useStore } from "zustand";
import type { TemporalState } from "zundo";
import { FormPreviewModal } from "./form-preview-modal";

interface BuilderHeaderProps {
  formId: string;
  onSave: () => Promise<void>;
  isSaving: boolean;
}

export function BuilderHeader({ formId, onSave, isSaving }: BuilderHeaderProps) {
  const title = useBuilderStore((s) => s.schema.title);
  const updateTitle = useBuilderStore((s) => s.updateTitle);
  const isDirty = useBuilderStore((s) => s.isDirty);
  const undo = useStore(useBuilderStore.temporal, (s) => s.undo);
  const redo = useStore(useBuilderStore.temporal, (s) => s.redo);
  const canUndo = useStore(useBuilderStore.temporal, (s) => s.pastStates.length > 0);
  const canRedo = useStore(useBuilderStore.temporal, (s) => s.futureStates.length > 0);
  const router = useRouter();
  const [formMeta, setFormMeta] = useState<{
    workspace_id: string;
    slug: string;
    status: string;
  } | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const guardedNavigate = useCallback(
    (href: string) => {
      if (isDirty) {
        if (
          !confirm("Você tem alterações não salvas. Deseja sair sem salvar?")
        )
          return;
      }
      router.push(href);
    },
    [isDirty, router]
  );

  useEffect(() => {
    fetch(`/api/v1/forms/${formId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((form) => {
        if (form)
          setFormMeta({
            workspace_id: form.workspace_id,
            slug: form.slug,
            status: form.status,
          });
      })
      .catch(() => {});
  }, [formId]);

  // Show "saved" checkmark briefly after save
  useEffect(() => {
    if (!isSaving && justSaved) {
      const t = setTimeout(() => setJustSaved(false), 2000);
      return () => clearTimeout(t);
    }
  }, [isSaving, justSaved]);

  async function handleSave() {
    await onSave();
    setJustSaved(true);
  }

  const isPublished = formMeta?.status === "published";

  async function handlePublish() {
    setPublishing(true);
    try {
      // Save first if dirty
      if (isDirty) await onSave();

      const endpoint = `/api/v1/forms/${formId}/publish`;
      const method = isPublished ? "DELETE" : "POST";
      const res = await fetch(endpoint, { method });
      if (res.ok) {
        const updated = await res.json();
        setFormMeta((prev) => prev ? { ...prev, status: updated.status, slug: updated.slug } : prev);
      }
    } finally {
      setPublishing(false);
    }
  }

  function handleCopyLink() {
    if (!formMeta?.slug) return;
    const url = `${window.location.origin}/f/${formMeta.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <header className="relative flex h-14 items-center justify-between border-b border-border bg-surface/80 backdrop-blur-md px-4">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => guardedNavigate("/admin/forms")}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-elevated hover:text-primary transition-colors"
          title="Voltar"
        >
          <ArrowLeft size={16} />
        </button>

        <div className="h-5 w-px bg-border" />

        <input
          type="text"
          value={title}
          onChange={(e) => updateTitle(e.target.value)}
          className="h-8 max-w-[280px] rounded-md border-0 bg-transparent px-2 text-sm font-semibold text-primary placeholder:text-muted outline-none focus:bg-elevated/50 transition-colors"
          placeholder="Título do formulário"
        />

        {/* Save status indicator */}
        <div className="flex items-center gap-1.5">
          {isSaving ? (
            <span className="flex items-center gap-1 text-xs text-muted animate-pulse">
              <Loader2 size={12} className="animate-spin" />
              Salvando...
            </span>
          ) : justSaved ? (
            <span className="flex items-center gap-1 text-xs text-success animate-fade-in">
              <CheckCircle2 size={12} />
              Salvo
            </span>
          ) : isDirty ? (
            <span className="flex items-center gap-1 text-xs text-warning">
              <span className="h-1.5 w-1.5 rounded-full bg-warning" />
              Não salvo
            </span>
          ) : null}
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1">
        {/* Undo/Redo group */}
        <div className="flex items-center rounded-lg bg-elevated/50 p-0.5">
          <button
            onClick={() => undo()}
            disabled={!canUndo}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-primary disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Desfazer (Ctrl+Z)"
          >
            <Undo2 size={14} />
          </button>
          <button
            onClick={() => redo()}
            disabled={!canRedo}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-primary disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Refazer (Ctrl+Y)"
          >
            <Redo2 size={14} />
          </button>
        </div>

        <div className="mx-1 h-5 w-px bg-border" />

        {/* Actions */}
        <button
          onClick={() => setPreviewOpen(true)}
          className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted hover:bg-elevated hover:text-primary transition-colors"
          title="Preview do formulário"
        >
          <Eye size={13} />
          Preview
        </button>

        <button
          onClick={() =>
            guardedNavigate(`/admin/forms/${formId}/responses`)
          }
          className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted hover:bg-elevated hover:text-primary transition-colors"
        >
          <ExternalLink size={13} />
          Respostas
        </button>

        <div className="mx-1 h-5 w-px bg-border" />

        <Button
          onClick={handleSave}
          disabled={isSaving || !isDirty}
          variant="outline"
          size="sm"
          className="h-8 gap-1.5"
        >
          <Save size={13} />
          Salvar
        </Button>

        {/* Publish / Unpublish */}
        <Button
          onClick={handlePublish}
          disabled={publishing}
          size="sm"
          className={cn(
            "h-8 gap-1.5",
            isPublished && "bg-emerald-600 hover:bg-emerald-700"
          )}
        >
          {publishing ? (
            <Loader2 size={13} className="animate-spin" />
          ) : isPublished ? (
            <Globe size={13} />
          ) : (
            <GlobeLock size={13} />
          )}
          {publishing ? "..." : isPublished ? "Publicado" : "Publicar"}
        </Button>

        {/* Published actions */}
        {isPublished && (
          <>
            <button
              onClick={handleCopyLink}
              className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs text-muted hover:bg-elevated hover:text-primary transition-colors"
              title="Copiar link"
            >
              {copied ? <CheckCircle2 size={13} className="text-green-400" /> : <Copy size={13} />}
            </button>
            <a
              href={`/f/${formMeta?.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs text-muted hover:bg-elevated hover:text-primary transition-colors"
              title="Abrir formulário"
            >
              <ExternalLink size={13} />
            </a>
          </>
        )}
      </div>

      {/* Preview Modal */}
      <FormPreviewModal isOpen={previewOpen} onClose={() => setPreviewOpen(false)} />
    </header>
  );
}
