"use client";

import { useState, useCallback } from "react";
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
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface RankingFieldProps {
  items: string[];
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}

export function RankingField({ items, value, onChange, error }: RankingFieldProps) {
  // Initialize with original order if no value set
  const ordered = value.length > 0 ? value : items;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = ordered.indexOf(active.id as string);
    const newIndex = ordered.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = [...ordered];
    const [moved] = newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, moved);
    onChange(newOrder);
  }

  function moveItem(index: number, direction: "up" | "down") {
    const newOrder = [...ordered];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= ordered.length) return;
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    onChange(newOrder);
  }

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ordered} strategy={verticalListSortingStrategy}>
          <div className="space-y-1.5">
            {ordered.map((item, index) => (
              <SortableRankItem
                key={item}
                id={item}
                label={item}
                position={index + 1}
                onMoveUp={() => moveItem(index, "up")}
                onMoveDown={() => moveItem(index, "down")}
                isFirst={index === 0}
                isLast={index === ordered.length - 1}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}

function SortableRankItem({
  id,
  label,
  position,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  id: string;
  label: string;
  position: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all",
        isDragging ? "opacity-50 border-accent" : "border-border"
      )}
    >
      {/* Drag handle */}
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted hover:text-primary">
        <GripVertical size={14} />
      </button>

      {/* Position number */}
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent/10 text-xs font-bold text-accent">
        {position}
      </span>

      {/* Label */}
      <span className="flex-1 text-sm">{label}</span>

      {/* Mobile up/down buttons */}
      <div className="flex flex-col gap-0.5 sm:hidden">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst}
          className="p-0.5 text-muted hover:text-primary disabled:opacity-30"
        >
          <ChevronUp size={12} />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast}
          className="p-0.5 text-muted hover:text-primary disabled:opacity-30"
        >
          <ChevronDown size={12} />
        </button>
      </div>
    </div>
  );
}
