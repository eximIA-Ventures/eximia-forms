"use client";

import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { X, Loader2 } from "lucide-react";
import { useBuilderStore } from "@/stores/builder-store";
import { useToast } from "@/components/ui/toast";

const FormRenderer = dynamic(
  () => import("@/components/renderer/form-renderer").then((m) => m.FormRenderer),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-muted" />
      </div>
    ),
  }
);

interface FormPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FormPreviewModal({ isOpen, onClose }: FormPreviewModalProps) {
  const schema = useBuilderStore((s) => s.schema);
  const toast = useToast();

  if (!isOpen) return null;

  const isLight = schema.theme?.mode === "light";
  const bg = schema.theme?.backgroundColor || (isLight ? "#FFFFFF" : "#0A0A0A");

  async function handlePreviewSubmit() {
    toast.success("Preview — dados não enviados");
    onClose();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ backgroundColor: bg }}
    >
      {/* Header bar */}
      <div
        className="flex h-12 items-center justify-between border-b px-4"
        style={{
          backgroundColor: isLight ? "rgba(255,255,255,0.9)" : "rgba(20,20,20,0.9)",
          borderColor: isLight ? "#e5e5e5" : "#333",
          color: isLight ? "#333" : "#999",
        }}
      >
        <span className="text-xs font-medium">
          Preview — visualização como respondente
        </span>
        <button
          onClick={onClose}
          className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-colors hover:opacity-70"
        >
          <X size={14} />
          Fechar preview
        </button>
      </div>

      {/* Form content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <FormRenderer
            formId="preview"
            schema={schema}
            onSubmit={handlePreviewSubmit}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
