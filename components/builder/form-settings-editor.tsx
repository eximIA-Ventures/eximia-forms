"use client";

import { useBuilderStore } from "@/stores/builder-store";
import { Input, Textarea, Select } from "@/components/ui";
import { Image, Palette, Type, MessageSquare, Upload, Sun, Moon, X } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

const FONT_OPTIONS = [
  { label: "Inter (padrão)", value: "Inter, system-ui, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "System UI", value: "system-ui, sans-serif" },
];

const MAX_LOGO_SIZE = 512 * 1024; // 512 KB

export function FormSettingsEditor() {
  const theme = useBuilderStore((s) => s.schema.theme);
  const settings = useBuilderStore((s) => s.schema.settings);
  const updateTheme = useBuilderStore((s) => s.updateTheme);
  const updateSettings = useBuilderStore((s) => s.updateSettings);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const logo = theme?.logo || "";
  const primaryColor = theme?.primaryColor || "#C4A882";
  const backgroundColor = theme?.backgroundColor || "#0A0A0A";
  const fontFamily = theme?.fontFamily || "Inter, system-ui, sans-serif";
  const borderRadius = theme?.borderRadius ?? 8;
  const mode = theme?.mode || "dark";

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_LOGO_SIZE) {
      alert("Imagem muito grande. Máximo 512 KB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Selecione um arquivo de imagem.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateTheme({ logo: reader.result as string });
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be re-selected
    e.target.value = "";
  }

  function removeLogo() {
    updateTheme({ logo: undefined });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Modo */}
      <Section title="Modo" icon={mode === "dark" ? Moon : Sun}>
        <div className="flex gap-2">
          {(["light", "dark"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                updateTheme({
                  mode: m,
                  backgroundColor: m === "light" ? "#FFFFFF" : "#0A0A0A",
                });
              }}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors",
                mode === m
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-muted hover:bg-elevated hover:text-primary"
              )}
            >
              {m === "light" ? <Sun size={14} /> : <Moon size={14} />}
              {m === "light" ? "Claro" : "Escuro"}
            </button>
          ))}
        </div>
      </Section>

      {/* Marca */}
      <Section title="Marca" icon={Image}>
        <FieldGroup label="Logo">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />

          {logo ? (
            <div className="relative rounded-lg border border-border bg-elevated/50 p-4">
              <div className="flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logo}
                  alt="Logo preview"
                  className="max-h-16 max-w-full object-contain"
                />
              </div>
              <button
                onClick={removeLogo}
                className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-surface/80 text-muted hover:bg-danger/20 hover:text-danger transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border px-4 py-6 text-muted hover:border-accent/30 hover:text-primary transition-colors"
            >
              <Upload size={20} />
              <span className="text-xs">Clique para enviar uma imagem</span>
              <span className="text-[10px] text-muted/50">PNG, JPG, SVG · máx 512 KB</span>
            </button>
          )}

          {logo && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-xs text-muted hover:bg-elevated hover:text-primary transition-colors"
            >
              Substituir imagem
            </button>
          )}
        </FieldGroup>

        <FieldGroup label="Ou cole uma URL">
          <Input
            value={logo.startsWith("data:") ? "" : logo}
            onChange={(e) => updateTheme({ logo: e.target.value || undefined })}
            placeholder="https://exemplo.com/logo.png"
          />
        </FieldGroup>
      </Section>

      {/* Cores */}
      <Section title="Cores" icon={Palette}>
        <FieldGroup label="Cor principal">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => updateTheme({ primaryColor: e.target.value })}
              className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
            />
            <Input
              value={primaryColor}
              onChange={(e) => updateTheme({ primaryColor: e.target.value })}
              placeholder="#C4A882"
              className="flex-1"
            />
          </div>
        </FieldGroup>
        <FieldGroup label="Cor de fundo">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
              className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
            />
            <Input
              value={backgroundColor}
              onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
              placeholder="#0A0A0A"
              className="flex-1"
            />
          </div>
        </FieldGroup>
      </Section>

      {/* Tipografia */}
      <Section title="Tipografia" icon={Type}>
        <FieldGroup label="Fonte">
          <Select
            options={FONT_OPTIONS}
            value={fontFamily}
            onChange={(e) => updateTheme({ fontFamily: e.target.value })}
          />
        </FieldGroup>
        <FieldGroup label="Arredondamento (px)">
          <Input
            type="number"
            min={0}
            max={24}
            value={borderRadius}
            onChange={(e) =>
              updateTheme({ borderRadius: parseInt(e.target.value) || 0 })
            }
          />
        </FieldGroup>
      </Section>

      {/* Agradecimento */}
      <Section title="Agradecimento" icon={MessageSquare}>
        <FieldGroup label="Título">
          <Input
            value={settings.thankYouTitle || ""}
            onChange={(e) => updateSettings({ thankYouTitle: e.target.value })}
            placeholder="Obrigado!"
          />
        </FieldGroup>
        <FieldGroup label="Mensagem">
          <Textarea
            value={settings.thankYouMessage || ""}
            onChange={(e) =>
              updateSettings({ thankYouMessage: e.target.value })
            }
            rows={3}
            placeholder="Sua resposta foi registrada com sucesso."
          />
        </FieldGroup>
      </Section>
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
