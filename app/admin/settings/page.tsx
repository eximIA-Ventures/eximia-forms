"use client";

import { Button, Input } from "@/components/ui";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl p-6 md:p-8">
      <h1 className="mb-6 text-2xl font-bold">Configurações</h1>

      <div className="space-y-6">
        {/* Workspace settings */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold">Workspace</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Nome</label>
              <Input defaultValue="Meu Workspace" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Slug</label>
              <Input defaultValue="meu-workspace" disabled />
              <p className="mt-1 text-xs text-muted">
                Usado na URL pública dos formulários
              </p>
            </div>
          </div>
        </div>

        {/* API Key */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold">API</h2>
          <p className="mb-4 text-sm text-muted">
            Use a API para criar formulários e acessar respostas programaticamente.
          </p>
          <div>
            <label className="mb-1 block text-sm font-medium">Chave Anthropic (IA)</label>
            <Input type="password" placeholder="sk-ant-..." />
            <p className="mt-1 text-xs text-muted">
              Necessária para funcionalidades de IA (geração de forms, análise de respostas)
            </p>
          </div>
        </div>

        <Button>Salvar configurações</Button>
      </div>
    </div>
  );
}
