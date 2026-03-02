"use client";

import { FormRenderer } from "@/components/renderer";
import { Sparkles } from "lucide-react";
import type { FormSchema } from "@/lib/types";

interface PublicFormClientProps {
  formId: string;
  schema: FormSchema;
}

export function PublicFormClient({ formId, schema }: PublicFormClientProps) {
  async function handleSubmit(data: Record<string, unknown>) {
    const res = await fetch(`/api/v1/forms/${formId}/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data,
        started_at: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      throw new Error("Erro ao enviar resposta");
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <FormRenderer formId={formId} schema={schema} onSubmit={handleSubmit} />

      {/* Footer */}
      <div className="mt-12 flex items-center justify-center gap-1.5 text-xs text-muted/40">
        <Sparkles size={12} />
        <span>Powered by eximIA Forms</span>
      </div>
    </div>
  );
}
