"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useBuilderStore } from "@/stores/builder-store";
import { FIELD_TYPES, type FormElement } from "@/lib/types";
import * as LucideIcons from "lucide-react";
import {
  GripVertical,
  Trash2,
  Copy,
  ChevronDown,
  Star,
  Calendar,
  Upload,
  Square,
  GitBranch,
  Pin,
  PinOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Icons = LucideIcons as unknown as Record<string, React.ComponentType<any>>;

interface SortableFieldCardProps {
  element: FormElement;
  isSelected: boolean;
  onSelect: () => void;
  questionNumber?: number;
  hasConditions?: boolean;
}

export function SortableFieldCard({
  element,
  isSelected,
  onSelect,
  questionNumber,
  hasConditions,
}: SortableFieldCardProps) {
  const removeElement = useBuilderStore((s) => s.removeElement);
  const duplicateElement = useBuilderStore((s) => s.duplicateElement);
  const togglePinElement = useBuilderStore((s) => s.togglePinElement);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const meta = FIELD_TYPES.find((f) => f.type === element.type);
  const Icon = meta ? Icons[meta.icon] || Square : Square;
  const isLayout = ["heading", "paragraph", "divider"].includes(element.type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "field-card group relative rounded-xl border bg-surface transition-all cursor-pointer",
        isSelected
          ? "border-accent shadow-lg shadow-accent/5 ring-1 ring-accent/20"
          : "border-border hover:border-border-hover",
        isDragging && "dragging opacity-50 scale-[0.98]",
        isLayout ? "p-3" : "p-4"
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Drag handle */}
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          {...attributes}
          {...listeners}
          className="flex h-7 w-5 items-center justify-center rounded-md bg-surface border border-border text-muted hover:text-primary hover:border-accent/30 cursor-grab active:cursor-grabbing shadow-sm transition-colors"
        >
          <GripVertical size={12} />
        </button>
      </div>

      {/* Actions */}
      <div className="absolute right-2 top-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePinElement(element.id);
          }}
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-md transition-colors",
            element.pinned
              ? "text-accent bg-accent/10"
              : "text-muted hover:bg-elevated hover:text-primary"
          )}
          title={element.pinned ? "Desafixar posição" : "Fixar posição (não será embaralhado)"}
        >
          {element.pinned ? <Pin size={11} /> : <PinOff size={11} />}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            duplicateElement(element.id);
          }}
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted hover:bg-elevated hover:text-primary transition-colors"
          title="Duplicar"
        >
          <Copy size={11} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeElement(element.id);
          }}
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted hover:bg-danger/10 hover:text-danger transition-colors"
          title="Remover"
        >
          <Trash2 size={11} />
        </button>
      </div>

      {/* Field content */}
      <div className="flex items-start gap-3">
        {/* Number + icon column */}
        <div className="flex flex-col items-center gap-1 pt-0.5">
          {questionNumber !== undefined ? (
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/10 text-[10px] font-bold text-accent">
              {questionNumber}
            </span>
          ) : (
            <div
              className={cn(
                "rounded-md p-1.5",
                isLayout
                  ? "bg-elevated text-muted"
                  : "bg-accent/10 text-accent"
              )}
            >
              <Icon size={13} />
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-sm font-medium truncate",
                isLayout && "text-muted"
              )}
            >
              {element.label}
            </span>
            {element.required && (
              <span className="text-[10px] text-danger font-medium">
                obrigatório
              </span>
            )}
            {hasConditions && (
              <span className="flex items-center gap-0.5 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-medium text-amber-400" title="Tem condições de exibição">
                <GitBranch size={8} />
                condicional
              </span>
            )}
            {element.pinned && (
              <span className="flex items-center gap-0.5 rounded-full bg-accent/10 px-1.5 py-0.5 text-[9px] font-medium text-accent" title="Posição fixa durante aleatorização">
                <Pin size={8} />
                fixo
              </span>
            )}
            {!isLayout && (
              <span className="ml-auto text-[9px] text-muted/40 font-medium uppercase tracking-wider">
                {meta?.label}
              </span>
            )}
          </div>
          {element.description && (
            <p className="mt-0.5 text-xs text-muted/70 truncate">
              {element.description}
            </p>
          )}
          <div className={isLayout && element.type !== "divider" ? "mt-1" : "mt-2.5"}>
            <FieldPreview element={element} />
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldPreview({ element }: { element: FormElement }) {
  const baseClasses =
    "w-full rounded-lg border border-border/60 bg-elevated/50 px-3 py-2 text-xs text-muted/60";

  switch (element.type) {
    case "text":
    case "email":
    case "number":
    case "phone":
    case "url":
      return (
        <div className={baseClasses}>
          {element.placeholder || `Digite ${element.label.toLowerCase()}...`}
        </div>
      );
    case "textarea":
    case "richtext":
      return (
        <div className={cn(baseClasses, "min-h-[48px]")}>
          {element.placeholder || "Digite aqui..."}
        </div>
      );
    case "select":
    case "multiselect":
      return (
        <div className={cn(baseClasses, "flex items-center justify-between")}>
          <span>Selecione...</span>
          <ChevronDown size={12} />
        </div>
      );
    case "checkbox":
      return (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border border-border/60" />
          <span className="text-xs text-muted/60">{element.label}</span>
        </div>
      );
    case "radio":
      return (
        <div className="flex flex-col gap-1.5">
          {(Array.isArray(element.properties.options)
            ? element.properties.options.map((o: unknown) =>
                typeof o === "string" ? { label: o } : (o as { label: string })
              )
            : [{ label: "Opção 1" }]
          )
            .slice(0, 3)
            .map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-3.5 w-3.5 rounded-full border border-border/60" />
                <span className="text-xs text-muted/60">{opt.label}</span>
              </div>
            ))}
        </div>
      );
    case "rating":
      return (
        <div className="flex gap-1">
          {Array.from({ length: (element.properties.max as number) || 5 }).map(
            (_, i) => (
              <Star key={i} size={15} className="text-border" />
            )
          )}
        </div>
      );
    case "nps":
      return (
        <div className="flex gap-0.5">
          {Array.from({ length: 11 }).map((_, i) => (
            <div
              key={i}
              className="flex h-6 flex-1 items-center justify-center rounded border border-border/40 text-[9px] text-muted/40"
            >
              {i}
            </div>
          ))}
        </div>
      );
    case "scale":
      return (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted/40">
            {(element.properties.minLabel as string) || "1"}
          </span>
          <div className="h-1.5 flex-1 rounded-full bg-border/40" />
          <span className="text-[10px] text-muted/40">
            {(element.properties.maxLabel as string) || "10"}
          </span>
        </div>
      );
    case "date":
    case "datetime":
    case "time":
      return (
        <div className={cn(baseClasses, "flex items-center justify-between")}>
          <span>{element.type === "time" ? "HH:MM" : "DD/MM/AAAA"}</span>
          <Calendar size={12} />
        </div>
      );
    case "file":
    case "image":
      return (
        <div className="flex flex-col items-center rounded-lg border border-dashed border-border/40 p-3 text-center">
          <Upload size={16} className="text-muted/30" />
          <span className="mt-1 text-[10px] text-muted/40">
            Arraste ou clique para enviar
          </span>
        </div>
      );
    case "heading":
      return (
        <div className="text-base font-semibold text-cream-dim/70">
          {(element.properties.content as string) || "Título da seção"}
        </div>
      );
    case "paragraph":
      return (
        <div className="text-xs text-muted/60 leading-relaxed">
          {(element.properties.content as string) || "Texto explicativo aqui..."}
        </div>
      );
    case "divider":
      return <hr className="border-border/40" />;
    default:
      return <div className={baseClasses}>Campo</div>;
  }
}
