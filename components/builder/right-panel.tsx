"use client";

import { useBuilderStore } from "@/stores/builder-store";
import { FieldPropertiesEditor } from "./field-properties-editor";
import { FormSettingsEditor } from "./form-settings-editor";
import { Settings2, SlidersHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type TabKey = "properties" | "appearance";

export function RightPanel() {
  const selectedElementId = useBuilderStore((s) => s.selectedElementId);
  const [activeTab, setActiveTab] = useState<TabKey>(
    selectedElementId ? "properties" : "appearance"
  );

  // Auto-switch to properties when a field is selected
  useEffect(() => {
    if (selectedElementId) {
      setActiveTab("properties");
    }
  }, [selectedElementId]);

  const tabs = [
    { key: "properties" as TabKey, label: "Propriedades", icon: SlidersHorizontal },
    { key: "appearance" as TabKey, label: "Aparência", icon: Settings2 },
  ];

  return (
    <div className="flex h-full w-80 flex-col border-l border-border bg-surface/50">
      {/* Tab bar */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab.key
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-primary"
            )}
          >
            <tab.icon size={12} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "properties" ? (
        <FieldPropertiesEditor />
      ) : (
        <FormSettingsEditor />
      )}
    </div>
  );
}
