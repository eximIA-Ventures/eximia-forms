"use client";

import { useBuilderStore } from "@/stores/builder-store";
import { FieldPropertiesEditor } from "./field-properties-editor";
import { FormSettingsEditor } from "./form-settings-editor";
import { Settings2, SlidersHorizontal, GitBranch, AlertTriangle } from "lucide-react";
import { ConditionFlowPanel } from "./condition-flow-panel";
import { OrderBiasAnalyzer } from "./order-bias-analyzer";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type TabKey = "properties" | "appearance" | "flow" | "analysis";

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
    { key: "flow" as TabKey, label: "Fluxo", icon: GitBranch },
    { key: "analysis" as TabKey, label: "Análise", icon: AlertTriangle },
  ];

  return (
    <div className="flex h-full w-80 flex-col border-l border-border bg-surface/50">
      {/* Tab bar */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            title={tab.label}
            className={cn(
              "flex flex-1 items-center justify-center px-3 py-2.5 transition-colors border-b-2 -mb-px",
              activeTab === tab.key
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-primary"
            )}
          >
            <tab.icon size={14} />
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "properties" ? (
        <FieldPropertiesEditor />
      ) : activeTab === "appearance" ? (
        <FormSettingsEditor />
      ) : activeTab === "flow" ? (
        <ConditionFlowPanel />
      ) : (
        <OrderBiasAnalyzer onClose={() => setActiveTab("properties")} />
      )}
    </div>
  );
}
