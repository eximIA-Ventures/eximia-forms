"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useBuilderStore } from "@/stores/builder-store";
import { SortableFieldCard } from "./sortable-field-card";
import { Plus, MousePointerClick } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export function BuilderCanvas() {
  const schema = useBuilderStore((s) => s.schema);
  const selectedPageIndex = useBuilderStore((s) => s.selectedPageIndex);
  const reorderElements = useBuilderStore((s) => s.reorderElements);
  const selectElement = useBuilderStore((s) => s.selectElement);
  const selectedElementId = useBuilderStore((s) => s.selectedElementId);
  const addPage = useBuilderStore((s) => s.addPage);
  const selectPage = useBuilderStore((s) => s.selectPage);
  const removePage = useBuilderStore((s) => s.removePage);
  const updatePage = useBuilderStore((s) => s.updatePage);

  const [editingPageIndex, setEditingPageIndex] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  const currentPage = schema.pages[selectedPageIndex];
  const elements = currentPage?.elements || [];

  // Count answerable fields per page and total
  const fieldCounts = schema.pages.map(
    (p) =>
      p.elements.filter(
        (el) => !["heading", "paragraph", "divider"].includes(el.type)
      ).length
  );
  const totalFields = fieldCounts.reduce((a, b) => a + b, 0);

  useEffect(() => {
    if (editingPageIndex !== null && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingPageIndex]);

  function startEditing(index: number) {
    const page = schema.pages[index];
    setEditingTitle(page.title || `Página ${index + 1}`);
    setEditingPageIndex(index);
  }

  function finishEditing() {
    if (editingPageIndex !== null) {
      const trimmed = editingTitle.trim();
      if (trimmed) {
        updatePage(editingPageIndex, { title: trimmed });
      }
      setEditingPageIndex(null);
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = elements.findIndex((el) => el.id === active.id);
    const newIndex = elements.findIndex((el) => el.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      reorderElements(selectedPageIndex, oldIndex, newIndex);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Page tabs bar */}
      <div className="flex items-center gap-1 border-b border-border bg-surface/60 backdrop-blur-sm px-4 py-2">
        {schema.pages.map((page, index) => {
          const isActive = index === selectedPageIndex;
          const isEditing = editingPageIndex === index;

          return (
            <div
              key={page.id}
              className={cn(
                "group relative flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-all cursor-pointer",
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:bg-elevated hover:text-primary"
              )}
              onClick={() => {
                if (!isEditing) selectPage(index);
              }}
              onDoubleClick={() => startEditing(index)}
            >
              {/* Page number pill */}
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold",
                  isActive
                    ? "bg-accent/20 text-accent"
                    : "bg-elevated text-muted"
                )}
              >
                {index + 1}
              </span>

              {/* Title / Edit */}
              {isEditing ? (
                <input
                  ref={editInputRef}
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={finishEditing}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") finishEditing();
                    if (e.key === "Escape") setEditingPageIndex(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-28 bg-transparent border-b border-accent text-sm font-medium outline-none"
                />
              ) : (
                <span className={cn("text-xs font-medium", isActive && "font-semibold")}>
                  {page.title || `Página ${index + 1}`}
                </span>
              )}

              {/* Field count badge */}
              {!isEditing && fieldCounts[index] > 0 && (
                <span className="text-[9px] text-muted/50">
                  {fieldCounts[index]}
                </span>
              )}

              {/* Delete X */}
              {schema.pages.length > 1 && !isEditing && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    removePage(index);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.stopPropagation();
                      removePage(index);
                    }
                  }}
                  className="ml-0.5 hidden h-4 w-4 items-center justify-center rounded text-[10px] text-muted hover:bg-danger/10 hover:text-danger group-hover:flex transition-colors"
                >
                  ×
                </span>
              )}
            </div>
          );
        })}

        {/* Add page */}
        <button
          onClick={addPage}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-dashed border-border px-3 text-xs text-muted hover:border-accent/30 hover:text-primary transition-colors"
        >
          <Plus size={12} />
          Página
        </button>

        {/* Stats */}
        <div className="ml-auto flex items-center gap-3 text-[10px] text-muted/50">
          <span>{schema.pages.length} página{schema.pages.length > 1 ? "s" : ""}</span>
          <span>{totalFields} campo{totalFields !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Canvas area */}
      <div
        className="builder-canvas relative flex-1 overflow-y-auto p-8"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgb(var(--c-border) / 0.3) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
        onClick={() => selectElement(null)}
      >
        <div className="mx-auto max-w-2xl">
          {/* Logo preview */}
          {schema.theme?.logo && (
            <div className="mb-4 rounded-xl border border-border/50 bg-surface/60 backdrop-blur-sm p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={schema.theme.logo}
                alt="Logo"
                className="max-h-10 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}

          {/* Page header */}
          {currentPage?.title && (
            <div className="mb-8 rounded-xl border border-border/50 bg-surface/60 backdrop-blur-sm p-5">
              <h2 className="text-lg font-semibold">{currentPage.title}</h2>
              {currentPage.description && (
                <p className="mt-1 text-sm text-muted">
                  {currentPage.description}
                </p>
              )}
              <div className="mt-2 text-[10px] text-muted/50">
                Página {selectedPageIndex + 1} de {schema.pages.length}
                {fieldCounts[selectedPageIndex] > 0 &&
                  ` · ${fieldCounts[selectedPageIndex]} campo${fieldCounts[selectedPageIndex] !== 1 ? "s" : ""}`}
              </div>
            </div>
          )}

          {/* Elements */}
          {elements.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/60 bg-surface/30 py-20 text-center">
              <div className="mb-4 rounded-2xl bg-elevated p-5">
                <MousePointerClick size={32} className="text-muted/40" />
              </div>
              <p className="text-sm font-medium text-muted">
                Nenhum campo nesta página
              </p>
              <p className="mt-1.5 max-w-xs text-xs text-muted/50">
                Clique em um campo na paleta à esquerda para adicionar, ou
                arraste para reordenar
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={elements.map((el) => el.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-3">
                  {elements.map((element, index) => {
                    // Calculate global question number
                    const isLayout = ["heading", "paragraph", "divider"].includes(element.type);
                    let questionNumber: number | undefined;
                    if (!isLayout) {
                      let count = 0;
                      for (const page of schema.pages.slice(0, selectedPageIndex)) {
                        count += page.elements.filter(
                          (el) => !["heading", "paragraph", "divider"].includes(el.type)
                        ).length;
                      }
                      const currentPageFields = currentPage.elements.filter(
                        (el) => !["heading", "paragraph", "divider"].includes(el.type)
                      );
                      const idx = currentPageFields.findIndex((el) => el.id === element.id);
                      questionNumber = count + idx + 1;
                    }

                    return (
                      <SortableFieldCard
                        key={element.id}
                        element={element}
                        isSelected={selectedElementId === element.id}
                        onSelect={() => selectElement(element.id)}
                        questionNumber={questionNumber}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  );
}
