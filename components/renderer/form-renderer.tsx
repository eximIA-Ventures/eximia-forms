"use client";

import { useEffect, useCallback, useState } from "react";
import { useFormStore } from "@/stores/form-store";
import { FieldRenderer } from "./field-renderer";
import { Button } from "@/components/ui";
import { ChevronLeft, ChevronRight, Send, CheckCircle2, AlertCircle } from "lucide-react";
import type { FormSchema, FormTheme } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FormRendererProps {
  formId: string;
  schema: FormSchema;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
}

function getThemeStyles(theme?: FormTheme): React.CSSProperties {
  if (!theme) return {};
  return {
    "--form-accent": theme.primaryColor || undefined,
    "--form-bg": theme.backgroundColor || undefined,
    "--form-font": theme.fontFamily || undefined,
    "--form-radius": theme.borderRadius != null ? `${theme.borderRadius}px` : undefined,
  } as React.CSSProperties;
}

export function FormRenderer({ formId, schema, onSubmit }: FormRendererProps) {
  const store = useFormStore();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const themeStyles = getThemeStyles(schema.theme);

  useEffect(() => {
    store.setForm(formId, schema);
  }, [formId, schema]);

  const currentPage = schema.pages[store.currentPageIndex];
  const isFirstPage = store.currentPageIndex === 0;
  const isLastPage = store.currentPageIndex === schema.pages.length - 1;
  const progress = schema.pages.length > 1
    ? ((store.currentPageIndex + 1) / schema.pages.length) * 100
    : 100;

  const validatePage = useCallback(() => {
    if (!currentPage) return false;
    let valid = true;
    store.clearAllErrors();

    for (const element of currentPage.elements) {
      if (element.required && !["heading", "paragraph", "divider"].includes(element.type)) {
        const value = store.answers[element.id];
        if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
          store.setError(element.id, "Este campo é obrigatório");
          valid = false;
        }
      }

      // Email validation
      if (element.type === "email" && store.answers[element.id]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(store.answers[element.id] as string)) {
          store.setError(element.id, "Email inválido");
          valid = false;
        }
      }

      // URL validation
      if (element.type === "url" && store.answers[element.id]) {
        try {
          new URL(store.answers[element.id] as string);
        } catch {
          store.setError(element.id, "URL inválida");
          valid = false;
        }
      }
    }

    return valid;
  }, [currentPage, store]);

  const handleNext = useCallback(() => {
    if (validatePage()) {
      store.nextPage();
    }
  }, [validatePage, store]);

  const handleSubmit = useCallback(async () => {
    if (!validatePage()) return;
    setSubmitError(null);
    store.setSubmitting(true);
    try {
      await onSubmit(store.answers);
      store.setSubmitted();
    } catch (err) {
      store.setSubmitting(false);
      setSubmitError(
        err instanceof Error ? err.message : "Erro ao enviar resposta. Tente novamente."
      );
    }
  }, [validatePage, onSubmit, store]);

  // Thank you screen
  if (store.isSubmitted) {
    return (
      <div className={cn("form-renderer flex min-h-[60vh] flex-col items-center justify-center py-12 sm:py-16 text-center", schema.theme?.mode === "light" && "form-renderer-light")} style={themeStyles}>
        <div className="mb-4 rounded-full bg-accent-alt/10 p-4">
          <CheckCircle2 size={48} className="text-accent-alt" />
        </div>
        <h2 className="text-2xl font-bold">
          {schema.settings.thankYouTitle || "Obrigado!"}
        </h2>
        <p className="mt-2 max-w-md text-muted">
          {schema.settings.thankYouMessage || "Sua resposta foi registrada com sucesso."}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("form-renderer py-4 sm:py-8", schema.theme?.mode === "light" && "form-renderer-light")} style={themeStyles}>
      {/* Logo */}
      {schema.theme?.logo && (
        <div className="mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={schema.theme.logo}
            alt=""
            className="max-h-12 object-contain"
          />
        </div>
      )}

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold">{schema.title}</h1>
        {schema.description && (
          <p className="mt-2 text-muted">{schema.description}</p>
        )}
      </div>

      {/* Progress bar */}
      {schema.settings.showProgressBar && schema.pages.length > 1 && (
        <div className="mb-6 sm:mb-8">
          <div className="mb-1 flex justify-between text-xs text-muted">
            <span>Página {store.currentPageIndex + 1} de {schema.pages.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Page title */}
      {currentPage?.title && schema.pages.length > 1 && (
        <h2 className="mb-4 text-lg font-semibold">{currentPage.title}</h2>
      )}

      {/* Fields */}
      <div className="space-y-6">
        {currentPage?.elements.map((element) => {
          // Calculate global question number
          const layoutTypes = ["heading", "paragraph", "divider"];
          if (layoutTypes.includes(element.type)) {
            return <FieldRenderer key={element.id} element={element} />;
          }
          let questionNumber = 0;
          for (const page of schema.pages.slice(0, store.currentPageIndex)) {
            questionNumber += page.elements.filter((el) => !layoutTypes.includes(el.type)).length;
          }
          const pageElements = currentPage.elements.filter((el) => !layoutTypes.includes(el.type));
          const indexInPage = pageElements.findIndex((el) => el.id === element.id);
          questionNumber += indexInPage + 1;
          return <FieldRenderer key={element.id} element={element} questionNumber={questionNumber} />;
        })}
      </div>

      {/* Submission error */}
      {submitError && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle size={16} className="shrink-0" />
          {submitError}
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <div>
          {!isFirstPage && (
            <Button variant="ghost" onClick={store.prevPage} className="min-h-[44px]">
              <ChevronLeft size={16} />
              Anterior
            </Button>
          )}
        </div>
        <div>
          {isLastPage ? (
            <Button onClick={handleSubmit} disabled={store.isSubmitting} className="min-h-[44px]">
              {store.isSubmitting ? (
                "Enviando..."
              ) : (
                <>
                  Enviar
                  <Send size={16} />
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleNext} className="min-h-[44px]">
              Próximo
              <ChevronRight size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
