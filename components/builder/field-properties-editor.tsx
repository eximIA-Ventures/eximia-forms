"use client";

import { useBuilderStore } from "@/stores/builder-store";
import { FIELD_TYPES, type FormElement } from "@/lib/types";
import { Input, Textarea, Button } from "@/components/ui";
import { X, Plus, Trash2, Settings2, Type, ListChecks, ToggleLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Icons = LucideIcons as unknown as Record<string, React.ComponentType<any>>;

export function FieldPropertiesEditor() {
  const selectedElementId = useBuilderStore((s) => s.selectedElementId);
  const schema = useBuilderStore((s) => s.schema);
  const updateElement = useBuilderStore((s) => s.updateElement);
  const selectElement = useBuilderStore((s) => s.selectElement);

  if (!selectedElementId) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 rounded-2xl bg-elevated p-5">
          <Settings2 size={28} className="text-muted/30" />
        </div>
        <p className="text-sm font-medium text-muted">Nenhum campo selecionado</p>
        <p className="mt-1.5 max-w-[200px] text-xs text-muted/50">
          Clique em um campo no canvas para editar suas propriedades
        </p>
      </div>
    );
  }

  const element = schema.pages
    .flatMap((p) => p.elements)
    .find((el) => el.id === selectedElementId);

  if (!element) return null;

  const meta = FIELD_TYPES.find((f) => f.type === element.type);
  const FieldIcon = meta ? Icons[meta.icon] || LucideIcons.Square : LucideIcons.Square;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
            <FieldIcon size={14} className="text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Propriedades</h3>
            <p className="text-[10px] text-muted uppercase tracking-wider">{meta?.label || element.type}</p>
          </div>
        </div>
        <button
          onClick={() => selectElement(null)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-elevated hover:text-primary transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Properties */}
      <div className="flex-1 overflow-y-auto">
        {/* Content section */}
        <Section title="Conteúdo" icon={Type}>
          {/* Label */}
          <FieldGroup label="Label">
            <Input
              value={element.label}
              onChange={(e) =>
                updateElement(element.id, { label: e.target.value })
              }
            />
          </FieldGroup>

          {/* Description */}
          <FieldGroup label="Descrição">
            <Textarea
              value={element.description || ""}
              onChange={(e) =>
                updateElement(element.id, {
                  description: e.target.value || undefined,
                })
              }
              rows={2}
              placeholder="Texto de ajuda (opcional)"
            />
          </FieldGroup>

          {/* Placeholder (for input types) */}
          {![
            "heading",
            "paragraph",
            "divider",
            "checkbox",
            "radio",
            "rating",
            "nps",
            "scale",
            "file",
            "image",
          ].includes(element.type) && (
            <FieldGroup label="Placeholder">
              <Input
                value={element.placeholder || ""}
                onChange={(e) =>
                  updateElement(element.id, {
                    placeholder: e.target.value || undefined,
                  })
                }
                placeholder="Texto placeholder"
              />
            </FieldGroup>
          )}

          {/* Heading content */}
          {element.type === "heading" && (
            <FieldGroup label="Conteúdo">
              <Input
                value={(element.properties.content as string) || ""}
                onChange={(e) =>
                  updateElement(element.id, {
                    properties: {
                      ...element.properties,
                      content: e.target.value,
                    },
                  })
                }
                placeholder="Título da seção"
              />
            </FieldGroup>
          )}

          {/* Paragraph content */}
          {element.type === "paragraph" && (
            <FieldGroup label="Conteúdo">
              <Textarea
                value={(element.properties.content as string) || ""}
                onChange={(e) =>
                  updateElement(element.id, {
                    properties: {
                      ...element.properties,
                      content: e.target.value,
                    },
                  })
                }
                rows={4}
                placeholder="Texto explicativo..."
              />
            </FieldGroup>
          )}
        </Section>

        {/* Options section */}
        {["select", "multiselect", "radio"].includes(element.type) && (
          <Section title="Opções" icon={ListChecks}>
            <OptionsEditor element={element} />
          </Section>
        )}

        {/* Settings section */}
        {!["heading", "paragraph", "divider"].includes(element.type) && (
          <Section title="Configurações" icon={ToggleLeft}>
            {/* Required toggle */}
            <div className="flex items-center justify-between py-1">
              <label className="text-sm text-cream-dim">Obrigatório</label>
              <button
                onClick={() =>
                  updateElement(element.id, {
                    required: !element.required,
                  })
                }
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  element.required ? "bg-accent" : "bg-border"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-primary transition-transform shadow-sm",
                    element.required && "translate-x-5"
                  )}
                />
              </button>
            </div>

            {/* Rating max */}
            {element.type === "rating" && (
              <FieldGroup label="Máx estrelas">
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={(element.properties.max as number) || 5}
                  onChange={(e) =>
                    updateElement(element.id, {
                      properties: {
                        ...element.properties,
                        max: parseInt(e.target.value) || 5,
                      },
                    })
                  }
                />
              </FieldGroup>
            )}

            {/* Scale min/max/labels */}
            {element.type === "scale" && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <FieldGroup label="Mín">
                    <Input
                      type="number"
                      value={
                        (element.properties.min as number) || 1
                      }
                      onChange={(e) =>
                        updateElement(element.id, {
                          properties: {
                            ...element.properties,
                            min:
                              parseInt(e.target.value) || 1,
                          },
                        })
                      }
                    />
                  </FieldGroup>
                  <FieldGroup label="Máx">
                    <Input
                      type="number"
                      value={
                        (element.properties.max as number) || 10
                      }
                      onChange={(e) =>
                        updateElement(element.id, {
                          properties: {
                            ...element.properties,
                            max:
                              parseInt(e.target.value) || 10,
                          },
                        })
                      }
                    />
                  </FieldGroup>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <FieldGroup label="Label mín">
                    <Input
                      value={
                        (element.properties.minLabel as string) ||
                        ""
                      }
                      onChange={(e) =>
                        updateElement(element.id, {
                          properties: {
                            ...element.properties,
                            minLabel: e.target.value,
                          },
                        })
                      }
                      placeholder="Nada provável"
                    />
                  </FieldGroup>
                  <FieldGroup label="Label máx">
                    <Input
                      value={
                        (element.properties.maxLabel as string) ||
                        ""
                      }
                      onChange={(e) =>
                        updateElement(element.id, {
                          properties: {
                            ...element.properties,
                            maxLabel: e.target.value,
                          },
                        })
                      }
                      placeholder="Muito provável"
                    />
                  </FieldGroup>
                </div>
              </>
            )}
          </Section>
        )}
      </div>
    </div>
  );
}

/* ─── Reusable layout pieces ─── */

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border p-4 space-y-3">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
        <Icon size={12} />
        {title}
      </div>
      {children}
    </div>
  );
}

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

/* ─── Options editor ─── */

function normalizeOptions(raw: unknown): { label: string; value: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt
  );
}

function OptionsEditor({ element }: { element: FormElement }) {
  const updateElement = useBuilderStore((s) => s.updateElement);
  const options = normalizeOptions(element.properties.options);

  function updateOptions(newOptions: { label: string; value: string }[]) {
    updateElement(element.id, {
      properties: { ...element.properties, options: newOptions },
    });
  }

  return (
    <div>
      <div className="space-y-2">
        {options.map((opt, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-[10px] text-muted/50 bg-elevated">
              {index + 1}
            </span>
            <Input
              value={opt.label}
              onChange={(e) => {
                const newOptions = [...options];
                newOptions[index] = {
                  label: e.target.value,
                  value: e.target.value
                    .toLowerCase()
                    .replace(/\s+/g, "_"),
                };
                updateOptions(newOptions);
              }}
              className="flex-1"
            />
            <button
              onClick={() => {
                updateOptions(
                  options.filter((_, i) => i !== index)
                );
              }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-danger/10 hover:text-danger transition-colors"
              disabled={options.length <= 1}
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="mt-2 w-full border border-dashed border-border hover:border-accent/30"
        onClick={() =>
          updateOptions([
            ...options,
            {
              label: `Opção ${options.length + 1}`,
              value: `option_${options.length + 1}`,
            },
          ])
        }
      >
        <Plus size={12} />
        Adicionar opção
      </Button>
    </div>
  );
}
