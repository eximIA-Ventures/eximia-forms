"use client";

import { useState } from "react";
import { FIELD_TYPES, FIELD_CATEGORIES, type FieldType } from "@/lib/types";
import { useBuilderStore } from "@/stores/builder-store";
import { AiGenerator } from "@/components/ai";
import { FIELD_BUNDLES } from "@/lib/bundles";
import * as LucideIcons from "lucide-react";
import { Search, ChevronRight, Package } from "lucide-react";
import { cn } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Icons = LucideIcons as unknown as Record<string, React.ComponentType<any>>;

const CATEGORY_ICONS: Record<string, string> = {
  input: "TextCursorInput",
  choice: "ListChecks",
  date: "CalendarDays",
  media: "Image",
  rating: "Star",
  layout: "LayoutDashboard",
};

export function FieldPalette() {
  const addElement = useBuilderStore((s) => s.addElement);
  const appendElements = useBuilderStore((s) => s.appendElements);
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const filteredTypes = search
    ? FIELD_TYPES.filter((f) =>
        f.label.toLowerCase().includes(search.toLowerCase())
      )
    : FIELD_TYPES;

  function toggleCategory(id: string) {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="flex h-full w-[260px] flex-col border-r border-border bg-surface/50">
      {/* Header */}
      <div className="p-4 pb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Campos
        </h3>
        {/* Search */}
        <div className="relative mt-3">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar campo..."
            className="h-8 w-full rounded-lg border border-border bg-elevated pl-8 pr-3 text-xs text-primary placeholder:text-muted/50 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/20 transition-colors"
          />
        </div>
      </div>

      {/* AI Generator */}
      <div className="px-3 pb-3">
        <AiGenerator />
      </div>

      {/* Bundles (Pacotes) */}
      {FIELD_BUNDLES.length > 0 && !search && (
        <div className="px-3 pb-3">
          <button
            onClick={() => toggleCategory("_bundles")}
            className="mb-2 flex w-full items-center gap-2 rounded-md px-1 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted hover:text-primary transition-colors"
          >
            <ChevronRight
              size={10}
              className={cn(
                "transition-transform",
                !collapsed["_bundles"] && "rotate-90"
              )}
            />
            <Package size={11} />
            Pacotes
            <span className="ml-auto text-[9px] font-normal text-muted/50">
              {FIELD_BUNDLES.length}
            </span>
          </button>
          {!collapsed["_bundles"] && (
            <div className="space-y-1.5">
              {FIELD_BUNDLES.map((bundle) => {
                const BundleIcon = Icons[bundle.icon] || LucideIcons.Square;
                return (
                  <button
                    key={bundle.id}
                    onClick={() => {
                      // Generate fresh IDs for each field to avoid collisions
                      const fieldsWithNewIds = bundle.fields.map((f) => ({
                        ...f,
                        id: crypto.randomUUID().slice(0, 8),
                      }));
                      appendElements(fieldsWithNewIds);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-2 text-left transition-all hover:border-accent/30 hover:bg-accent/5"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
                      <BundleIcon size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium leading-tight">{bundle.name}</p>
                      <p className="text-[9px] text-muted truncate">{bundle.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Categories */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {FIELD_CATEGORIES.map((category) => {
          const fields = filteredTypes.filter(
            (f) => f.category === category.id
          );
          if (fields.length === 0) return null;

          const isCollapsed = collapsed[category.id];
          const CategoryIcon =
            Icons[CATEGORY_ICONS[category.id]] || LucideIcons.Square;

          return (
            <div key={category.id} className="mb-3">
              {/* Category header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="mb-2 flex w-full items-center gap-2 rounded-md px-1 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted hover:text-primary transition-colors"
              >
                <ChevronRight
                  size={10}
                  className={cn(
                    "transition-transform",
                    !isCollapsed && "rotate-90"
                  )}
                />
                <CategoryIcon size={11} />
                {category.label}
                <span className="ml-auto text-[9px] font-normal text-muted/50">
                  {fields.length}
                </span>
              </button>

              {/* Fields grid */}
              {!isCollapsed && (
                <div className="grid grid-cols-2 gap-1.5">
                  {fields.map((field) => {
                    const Icon = Icons[field.icon] || LucideIcons.Square;
                    return (
                      <button
                        key={field.type}
                        onClick={() =>
                          addElement(field.type as FieldType)
                        }
                        className={cn(
                          "group flex flex-col items-center gap-1.5 rounded-lg border border-transparent p-2.5 text-center transition-all",
                          "hover:border-accent/30 hover:bg-accent/5 hover:shadow-sm hover:shadow-accent/5",
                          "active:scale-[0.97]"
                        )}
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-elevated text-muted group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                          <Icon size={14} />
                        </div>
                        <span className="text-[10px] leading-tight text-muted group-hover:text-primary transition-colors">
                          {field.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
