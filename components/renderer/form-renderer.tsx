"use client";

import { useEffect, useCallback, useState, useMemo } from "react";
import { useFormStore } from "@/stores/form-store";
import { FieldRenderer } from "./field-renderer";
import { Button } from "@/components/ui";
import { ChevronLeft, ChevronRight, Send, CheckCircle2, AlertCircle } from "lucide-react";
import type { FormSchema, FormTheme, FormElement } from "@/lib/types";
import { evaluateConditions } from "@/lib/conditions/evaluate";
import { shuffle } from "@/lib/utils/shuffle";
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

  // Stable shuffle seed per session
  const [shuffleSeed] = useState(() => crypto.randomUUID());

  useEffect(() => {
    store.setForm(formId, schema);
  }, [formId, schema]);

  // Get visible page indices (page-level conditions)
  const visiblePageIndices = useMemo(() => {
    const indices = schema.pages
      .map((page, index) => ({ page, index }))
      .filter(({ page }) => evaluateConditions(page.conditions, store.answers))
      .map(({ index }) => index);

    // Shuffle middle pages if enabled (first and last always stay)
    if (schema.settings.shufflePages && indices.length > 2) {
      const first = indices[0];
      const last = indices[indices.length - 1];
      const middle = indices.slice(1, -1);
      const shuffledMiddle = shuffle(middle, shuffleSeed);
      return [first, ...shuffledMiddle, last];
    }
    return indices;
  }, [schema.pages, store.answers, schema.settings.shufflePages, shuffleSeed]);

  const currentPage = schema.pages[store.currentPageIndex];
  const visiblePositionOfCurrent = visiblePageIndices.indexOf(store.currentPageIndex);
  const isFirstVisible = visiblePositionOfCurrent === 0;
  const isLastVisible = visiblePositionOfCurrent === visiblePageIndices.length - 1;
  const totalVisiblePages = visiblePageIndices.length;
  const progress = totalVisiblePages > 1
    ? ((visiblePositionOfCurrent + 1) / totalVisiblePages) * 100
    : 100;

  // Get visible elements for the current page (element-level conditions)
  const visibleElements = useMemo(() => {
    if (!currentPage) return [];
    let elements = currentPage.elements.filter((el) =>
      evaluateConditions(el.conditions, store.answers)
    );
    // Apply pin-aware shuffle if page has shuffleElements enabled
    if (currentPage.shuffleElements) {
      const layoutTypes = ["heading", "paragraph", "divider"];
      const result = new Array<FormElement>(elements.length);
      const pinnedIndices: number[] = [];
      const unpinned: FormElement[] = [];

      elements.forEach((el, i) => {
        // Layout types and pinned elements keep their position
        if (layoutTypes.includes(el.type) || el.pinned) {
          result[i] = el;
          pinnedIndices.push(i);
        } else {
          unpinned.push(el);
        }
      });

      const shuffled = shuffle(unpinned, shuffleSeed + currentPage.id);
      let j = 0;
      for (let i = 0; i < result.length; i++) {
        if (!pinnedIndices.includes(i)) {
          result[i] = shuffled[j++];
        }
      }
      elements = result;
    }
    return elements;
  }, [currentPage, store.answers, shuffleSeed]);

  const validatePage = useCallback(() => {
    if (!currentPage) return false;
    let valid = true;
    store.clearAllErrors();

    const layoutTypes = ["heading", "paragraph", "divider"];

    for (const element of visibleElements) {
      if (element.required && !layoutTypes.includes(element.type)) {
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
  }, [currentPage, visibleElements, store]);

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
      // Only submit answers from visible elements
      const allVisibleIds = new Set<string>();
      for (const pageIdx of visiblePageIndices) {
        const page = schema.pages[pageIdx];
        for (const el of page.elements) {
          if (evaluateConditions(el.conditions, store.answers)) {
            allVisibleIds.add(el.id);
          }
        }
      }
      const filteredAnswers: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(store.answers)) {
        if (allVisibleIds.has(key)) {
          filteredAnswers[key] = val;
        }
      }
      await onSubmit(filteredAnswers);
      store.setSubmitted();
    } catch (err) {
      store.setSubmitting(false);
      setSubmitError(
        err instanceof Error ? err.message : "Erro ao enviar resposta. Tente novamente."
      );
    }
  }, [validatePage, onSubmit, store, visiblePageIndices, schema]);

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
      {schema.settings.showProgressBar && totalVisiblePages > 1 && (
        <div className="mb-6 sm:mb-8">
          <div className="mb-1 flex justify-between text-xs text-muted">
            <span>Página {visiblePositionOfCurrent + 1} de {totalVisiblePages}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Page title */}
      {currentPage?.title && totalVisiblePages > 1 && (
        <h2 className="mb-4 text-lg font-semibold">{currentPage.title}</h2>
      )}

      {/* Fields */}
      <div className="space-y-6">
        {visibleElements.map((element) => {
          // Calculate global question number (only visible fields)
          const layoutTypes = ["heading", "paragraph", "divider"];
          if (layoutTypes.includes(element.type)) {
            return <FieldRenderer key={element.id} element={element} shuffleSeed={shuffleSeed} />;
          }
          // Count visible answerable fields across visible pages before this one
          let questionNumber = 0;
          for (const pi of visiblePageIndices) {
            if (pi >= store.currentPageIndex) break;
            const page = schema.pages[pi];
            const visEls = page.elements.filter(
              (el) =>
                !layoutTypes.includes(el.type) &&
                evaluateConditions(el.conditions, store.answers)
            );
            questionNumber += visEls.length;
          }
          // Count within current page up to this element
          const currentVisibleFields = visibleElements.filter(
            (el) => !layoutTypes.includes(el.type)
          );
          const indexInPage = currentVisibleFields.findIndex((el) => el.id === element.id);
          questionNumber += indexInPage + 1;

          return <FieldRenderer key={element.id} element={element} questionNumber={questionNumber} shuffleSeed={shuffleSeed} />;
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
          {!isFirstVisible && (
            <Button variant="ghost" onClick={store.prevPage} className="min-h-[44px]">
              <ChevronLeft size={16} />
              Anterior
            </Button>
          )}
        </div>
        <div>
          {isLastVisible ? (
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
