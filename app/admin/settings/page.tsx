"use client";

import { useEffect, useState } from "react";
import { Button, Input } from "@/components/ui";
import { Loader2, Save, CreditCard, ExternalLink, ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import type { UserPlan } from "@/lib/types";

interface Workspace {
  id: string;
  name: string;
  slug: string;
}

interface ProfileData {
  plan: UserPlan;
  subscription_status: string | null;
  stripe_customer_id: string | null;
}

export default function SettingsPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        // Fetch workspace
        const wsRes = await fetch("/api/v1/workspaces");
        if (wsRes.ok) {
          const workspaces = await wsRes.json();
          if (workspaces.length > 0) {
            setWorkspace(workspaces[0]);
            setWorkspaceName(workspaces[0].name);
          }
        }

        // Fetch profile
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("user_profiles")
            .select("plan, subscription_status, stripe_customer_id")
            .eq("id", user.id)
            .single();
          if (data) setProfile(data as ProfileData);
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave() {
    if (!workspace || !workspaceName.trim()) return;
    setSaving(true);
    setSaved(false);

    try {
      const supabase = createClient();
      await supabase
        .from("form_workspaces")
        .update({ name: workspaceName.trim() })
        .eq("id", workspace.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  }

  async function handlePortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {}
    setPortalLoading(false);
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted" />
      </div>
    );
  }

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
              <Input
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="Nome do workspace"
              />
            </div>
            {workspace && (
              <div>
                <label className="mb-1 block text-sm font-medium">Slug</label>
                <Input value={workspace.slug} disabled />
                <p className="mt-1 text-xs text-muted">
                  Usado na URL pública dos formulários
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Billing */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold">Assinatura</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">
                Plano atual:{" "}
                <span className="font-semibold capitalize">{profile?.plan || "free"}</span>
              </p>
              {profile?.subscription_status && profile.subscription_status !== "inactive" && (
                <p className="text-xs text-muted mt-0.5">
                  Status: {profile.subscription_status === "active" ? "Ativo" :
                    profile.subscription_status === "past_due" ? "Pagamento pendente" :
                    profile.subscription_status === "canceled" ? "Cancelado" :
                    profile.subscription_status}
                </p>
              )}
            </div>
            {profile?.stripe_customer_id ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePortal}
                disabled={portalLoading}
                className="gap-1.5"
              >
                {portalLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CreditCard size={14} />
                )}
                Gerenciar
                <ExternalLink size={10} />
              </Button>
            ) : (
              <Link
                href="/admin/upgrade"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-elevated transition-colors"
              >
                Fazer upgrade
                <ArrowUpRight size={12} />
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={saving || !workspaceName.trim()}
            className="gap-2"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Salvar configurações
          </Button>
          {saved && (
            <span className="text-sm text-green-400">Salvo!</span>
          )}
        </div>
      </div>
    </div>
  );
}
