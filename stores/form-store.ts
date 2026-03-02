"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FormSchema } from "@/lib/types";

interface FormRendererState {
  // Form data
  formId: string | null;
  schema: FormSchema | null;
  currentPageIndex: number;
  answers: Record<string, unknown>;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isSubmitted: boolean;
  startedAt: string | null;

  // Actions
  setForm: (formId: string, schema: FormSchema) => void;
  setAnswer: (fieldId: string, value: unknown) => void;
  setError: (fieldId: string, error: string) => void;
  clearError: (fieldId: string) => void;
  clearAllErrors: () => void;
  nextPage: () => boolean;
  prevPage: () => void;
  goToPage: (index: number) => void;
  setSubmitting: (submitting: boolean) => void;
  setSubmitted: () => void;
  reset: () => void;
}

export const useFormStore = create<FormRendererState>()(
  persist(
    (set, get) => ({
      formId: null,
      schema: null,
      currentPageIndex: 0,
      answers: {},
      errors: {},
      isSubmitting: false,
      isSubmitted: false,
      startedAt: null,

      setForm: (formId, schema) => {
        const state = get();
        // Resume if same form (keep answers/page), otherwise start fresh
        if (state.formId === formId && !state.isSubmitted) {
          // Always set schema (it's not persisted)
          set({ schema });
          return;
        }
        set({
          formId,
          schema,
          currentPageIndex: 0,
          answers: {},
          errors: {},
          isSubmitting: false,
          isSubmitted: false,
          startedAt: new Date().toISOString(),
        });
      },

      setAnswer: (fieldId, value) =>
        set((state) => ({
          answers: { ...state.answers, [fieldId]: value },
          errors: (() => {
            const e = { ...state.errors };
            delete e[fieldId];
            return e;
          })(),
        })),

      setError: (fieldId, error) =>
        set((state) => ({
          errors: { ...state.errors, [fieldId]: error },
        })),

      clearError: (fieldId) =>
        set((state) => {
          const errors = { ...state.errors };
          delete errors[fieldId];
          return { errors };
        }),

      clearAllErrors: () => set({ errors: {} }),

      nextPage: () => {
        const { schema, currentPageIndex } = get();
        if (!schema) return false;
        if (currentPageIndex < schema.pages.length - 1) {
          set({ currentPageIndex: currentPageIndex + 1 });
          return true;
        }
        return false;
      },

      prevPage: () =>
        set((state) => ({
          currentPageIndex: Math.max(0, state.currentPageIndex - 1),
        })),

      goToPage: (index) =>
        set((state) => {
          if (!state.schema) return state;
          return {
            currentPageIndex: Math.max(0, Math.min(index, state.schema.pages.length - 1)),
          };
        }),

      setSubmitting: (submitting) => set({ isSubmitting: submitting }),

      setSubmitted: () => set({ isSubmitted: true, isSubmitting: false }),

      reset: () =>
        set({
          formId: null,
          schema: null,
          currentPageIndex: 0,
          answers: {},
          errors: {},
          isSubmitting: false,
          isSubmitted: false,
          startedAt: null,
        }),
    }),
    {
      name: "eximia-forms-progress",
      partialize: (state) => ({
        formId: state.formId,
        currentPageIndex: state.currentPageIndex,
        answers: state.answers,
        startedAt: state.startedAt,
        isSubmitted: state.isSubmitted,
      }),
    }
  )
);
