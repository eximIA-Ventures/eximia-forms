"use client";

import { create } from "zustand";
import { temporal } from "zundo";
import type {
  FormSchema,
  FormElement,
  FormPage,
  FieldType,
} from "@/lib/types";
import { createDefaultFormSchema, createDefaultElement } from "@/lib/types";

interface BuilderState {
  // Form data
  schema: FormSchema;
  isDirty: boolean;
  selectedElementId: string | null;
  selectedPageIndex: number;

  // Actions — Schema
  setSchema: (schema: FormSchema) => void;
  updateTitle: (title: string) => void;
  updateDescription: (description: string) => void;
  updateSettings: (settings: Partial<FormSchema["settings"]>) => void;
  updateTheme: (theme: Partial<NonNullable<FormSchema["theme"]>>) => void;

  // Actions — Pages
  addPage: () => void;
  removePage: (index: number) => void;
  updatePage: (index: number, updates: Partial<FormPage>) => void;
  selectPage: (index: number) => void;
  reorderPages: (fromIndex: number, toIndex: number) => void;

  // Actions — Elements
  addElement: (type: FieldType, pageIndex?: number, atIndex?: number) => void;
  appendElements: (elements: FormElement[], pageIndex?: number) => void;
  duplicateElement: (elementId: string) => void;
  removeElement: (elementId: string) => void;
  updateElement: (elementId: string, updates: Partial<FormElement>) => void;
  selectElement: (elementId: string | null) => void;
  reorderElements: (pageIndex: number, fromIndex: number, toIndex: number) => void;
  moveElementToPage: (elementId: string, targetPageIndex: number, atIndex?: number) => void;
  togglePinElement: (elementId: string) => void;

  // Actions — State
  markClean: () => void;
  reset: () => void;
}

export const useBuilderStore = create<BuilderState>()(
  temporal(
    (set, get) => ({
      schema: createDefaultFormSchema(),
      isDirty: false,
      selectedElementId: null,
      selectedPageIndex: 0,

      setSchema: (schema) => set({ schema, isDirty: false, selectedElementId: null, selectedPageIndex: 0 }),

      updateTitle: (title) =>
        set((state) => ({
          schema: { ...state.schema, title },
          isDirty: true,
        })),

      updateDescription: (description) =>
        set((state) => ({
          schema: { ...state.schema, description },
          isDirty: true,
        })),

      updateSettings: (settings) =>
        set((state) => ({
          schema: {
            ...state.schema,
            settings: { ...state.schema.settings, ...settings },
          },
          isDirty: true,
        })),

      updateTheme: (theme) =>
        set((state) => ({
          schema: {
            ...state.schema,
            theme: { ...state.schema.theme, ...theme } as FormSchema["theme"],
          },
          isDirty: true,
        })),

      addPage: () =>
        set((state) => {
          const newPage: FormPage = {
            id: crypto.randomUUID().slice(0, 8),
            title: `Página ${state.schema.pages.length + 1}`,
            elements: [],
            conditions: [],
          };
          return {
            schema: {
              ...state.schema,
              pages: [...state.schema.pages, newPage],
            },
            selectedPageIndex: state.schema.pages.length,
            isDirty: true,
          };
        }),

      removePage: (index) =>
        set((state) => {
          if (state.schema.pages.length <= 1) return state;
          const pages = state.schema.pages.filter((_, i) => i !== index);
          return {
            schema: { ...state.schema, pages },
            selectedPageIndex: Math.min(state.selectedPageIndex, pages.length - 1),
            selectedElementId: null,
            isDirty: true,
          };
        }),

      updatePage: (index, updates) =>
        set((state) => {
          const pages = [...state.schema.pages];
          pages[index] = { ...pages[index], ...updates };
          return {
            schema: { ...state.schema, pages },
            isDirty: true,
          };
        }),

      selectPage: (index) => set({ selectedPageIndex: index, selectedElementId: null }),

      reorderPages: (fromIndex, toIndex) =>
        set((state) => {
          const pages = [...state.schema.pages];
          const [moved] = pages.splice(fromIndex, 1);
          pages.splice(toIndex, 0, moved);
          return {
            schema: { ...state.schema, pages },
            selectedPageIndex: toIndex,
            isDirty: true,
          };
        }),

      addElement: (type, pageIndex, atIndex) =>
        set((state) => {
          const pi = pageIndex ?? state.selectedPageIndex;
          const element = createDefaultElement(type);
          const pages = [...state.schema.pages];
          const elements = [...pages[pi].elements];

          if (atIndex !== undefined) {
            elements.splice(atIndex, 0, element);
          } else {
            elements.push(element);
          }

          pages[pi] = { ...pages[pi], elements };
          return {
            schema: { ...state.schema, pages },
            selectedElementId: element.id,
            isDirty: true,
          };
        }),

      appendElements: (elements, pageIndex) =>
        set((state) => {
          const pi = pageIndex ?? state.selectedPageIndex;
          const pages = [...state.schema.pages];
          pages[pi] = {
            ...pages[pi],
            elements: [...pages[pi].elements, ...elements],
          };
          return {
            schema: { ...state.schema, pages },
            isDirty: true,
          };
        }),

      duplicateElement: (elementId) =>
        set((state) => {
          for (const [pi, page] of state.schema.pages.entries()) {
            const idx = page.elements.findIndex((el) => el.id === elementId);
            if (idx === -1) continue;
            const original = page.elements[idx];
            const clone: FormElement = {
              ...JSON.parse(JSON.stringify(original)),
              id: crypto.randomUUID().slice(0, 8),
              label: `${original.label} (cópia)`,
            };
            const pages = [...state.schema.pages];
            const elements = [...pages[pi].elements];
            elements.splice(idx + 1, 0, clone);
            pages[pi] = { ...pages[pi], elements };
            return {
              schema: { ...state.schema, pages },
              selectedElementId: clone.id,
              isDirty: true,
            };
          }
          return state;
        }),

      removeElement: (elementId) =>
        set((state) => {
          const pages = state.schema.pages.map((page) => ({
            ...page,
            elements: page.elements.filter((el) => el.id !== elementId),
          }));
          return {
            schema: { ...state.schema, pages },
            selectedElementId:
              state.selectedElementId === elementId ? null : state.selectedElementId,
            isDirty: true,
          };
        }),

      updateElement: (elementId, updates) =>
        set((state) => {
          const pages = state.schema.pages.map((page) => ({
            ...page,
            elements: page.elements.map((el) =>
              el.id === elementId ? { ...el, ...updates } : el
            ),
          }));
          return {
            schema: { ...state.schema, pages },
            isDirty: true,
          };
        }),

      selectElement: (elementId) => set({ selectedElementId: elementId }),

      reorderElements: (pageIndex, fromIndex, toIndex) =>
        set((state) => {
          const pages = [...state.schema.pages];
          const elements = [...pages[pageIndex].elements];
          const [moved] = elements.splice(fromIndex, 1);
          elements.splice(toIndex, 0, moved);
          pages[pageIndex] = { ...pages[pageIndex], elements };
          return {
            schema: { ...state.schema, pages },
            isDirty: true,
          };
        }),

      moveElementToPage: (elementId, targetPageIndex, atIndex) =>
        set((state) => {
          let element: FormElement | undefined;
          const pages = state.schema.pages.map((page) => {
            const found = page.elements.find((el) => el.id === elementId);
            if (found) {
              element = found;
              return { ...page, elements: page.elements.filter((el) => el.id !== elementId) };
            }
            return page;
          });

          if (!element) return state;

          const targetElements = [...pages[targetPageIndex].elements];
          if (atIndex !== undefined) {
            targetElements.splice(atIndex, 0, element);
          } else {
            targetElements.push(element);
          }
          pages[targetPageIndex] = { ...pages[targetPageIndex], elements: targetElements };

          return {
            schema: { ...state.schema, pages },
            isDirty: true,
          };
        }),

      togglePinElement: (elementId) =>
        set((state) => {
          const pages = state.schema.pages.map((page) => ({
            ...page,
            elements: page.elements.map((el) =>
              el.id === elementId ? { ...el, pinned: !el.pinned } : el
            ),
          }));
          return {
            schema: { ...state.schema, pages },
            isDirty: true,
          };
        }),

      markClean: () => set({ isDirty: false }),
      reset: () =>
        set({
          schema: createDefaultFormSchema(),
          isDirty: false,
          selectedElementId: null,
          selectedPageIndex: 0,
        }),
    }),
    { limit: 50 }
  )
);
