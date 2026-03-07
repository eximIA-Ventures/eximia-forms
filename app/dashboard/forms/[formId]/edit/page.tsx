"use client";

import { useEffect, useState, use } from "react";
import { useBuilderStore } from "@/stores/builder-store";
import { BuilderHeader, FieldPalette, BuilderCanvas, RightPanel } from "@/components/builder";
import { useToast } from "@/components/ui/toast";
import { ToastProvider } from "@/components/ui/toast";
import type { FormSchema } from "@/lib/types";

export default function FormEditPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = use(params);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const setSchema = useBuilderStore((s) => s.setSchema);
  const schema = useBuilderStore((s) => s.schema);
  const markClean = useBuilderStore((s) => s.markClean);

  useEffect(() => {
    async function loadForm() {
      const res = await fetch(`/api/v1/forms/${formId}`);
      if (res.ok) {
        const form = await res.json();
        setSchema(form.schema as FormSchema);
      }
      setLoading(false);
    }
    loadForm();
  }, [formId, setSchema]);

  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/v1/forms/${formId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: schema.title,
          description: schema.description,
          schema,
        }),
      });
      if (res.ok) {
        markClean();
      }
    } finally {
      setIsSaving(false);
    }
  }

  // Keyboard shortcut: Ctrl+S to save
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [schema]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      const isDirty = useBuilderStore.getState().isDirty;
      if (!isDirty) return;
      e.preventDefault();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted">Carregando formulário...</p>
      </div>
    );
  }

  return (
    <ToastProvider>
      {/* Mobile: show "use desktop" message */}
      <div className="flex h-screen flex-col items-center justify-center gap-4 px-6 text-center md:hidden">
        <div className="rounded-2xl bg-accent/10 p-5">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
        </div>
        <h2 className="text-lg font-semibold">Editor de formulários</h2>
        <p className="max-w-xs text-sm text-muted">
          O editor funciona melhor em telas maiores. Acesse pelo computador para a melhor experiência.
        </p>
      </div>
      {/* Desktop: full builder */}
      <div className="hidden md:flex h-screen flex-col">
        <BuilderHeader formId={formId} onSave={handleSave} isSaving={isSaving} />
        <div className="flex flex-1 overflow-hidden">
          <FieldPalette />
          <BuilderCanvas />
          <RightPanel />
        </div>
      </div>
    </ToastProvider>
  );
}
