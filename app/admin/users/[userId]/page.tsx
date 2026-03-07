"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUserRole } from "@/lib/auth/use-user-role";
import { Button } from "@/components/ui";
import {
  ArrowLeft,
  Shield,
  UserCheck,
  UserX,
  FileText,
  Inbox,
  Loader2,
  Trash2,
  Layers,
} from "lucide-react";
import type { UserRole, UserPlan } from "@/lib/types";
import { USER_PLANS } from "@/lib/types";

interface UserDetail {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  plan: UserPlan;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  workspaces: { id: string; name: string; slug: string }[];
  forms: {
    id: string;
    title: string;
    status: string;
    created_at: string;
    updated_at: string;
  }[];
  submission_count: number;
}

export default function UserDetailPage() {
  const { isSuperAdmin, loading: roleLoading } = useUserRole();
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!roleLoading && !isSuperAdmin) router.push("/admin");
  }, [roleLoading, isSuperAdmin, router]);

  useEffect(() => {
    if (!isSuperAdmin || !userId) return;
    fetchUser();
  }, [isSuperAdmin, userId]);

  async function fetchUser() {
    const res = await fetch(`/api/v1/admin/users/${userId}`);
    if (res.ok) setUser(await res.json());
    setLoading(false);
  }

  async function toggleActive() {
    if (!user) return;
    setActionLoading(true);
    await fetch(`/api/v1/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !user.is_active }),
    });
    await fetchUser();
    setActionLoading(false);
  }

  async function toggleRole() {
    if (!user) return;
    setActionLoading(true);
    const newRole = user.role === "super_admin" ? "user" : "super_admin";
    await fetch(`/api/v1/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    await fetchUser();
    setActionLoading(false);
  }

  async function changePlan(plan: UserPlan) {
    if (!user) return;
    setActionLoading(true);
    await fetch(`/api/v1/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    await fetchUser();
    setActionLoading(false);
  }

  async function deleteUser() {
    if (!confirm("Tem certeza que deseja excluir este usuário? Esta ação é irreversível.")) return;
    setActionLoading(true);
    await fetch(`/api/v1/admin/users/${userId}`, { method: "DELETE" });
    router.push("/admin/users");
  }

  if (roleLoading || loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center text-muted">Usuário não encontrado</div>
    );
  }

  const currentPlanMeta = USER_PLANS.find((p) => p.value === user.plan);

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <button
        onClick={() => router.push("/admin/users")}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors"
      >
        <ArrowLeft size={16} />
        Voltar para Usuários
      </button>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            {user.full_name || "Sem nome"}
          </h1>
          <p className="text-sm text-muted">{user.email}</p>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {user.role === "super_admin" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                <Shield size={12} />
                Super Admin
              </span>
            )}
            {user.is_active ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-400">
                <UserCheck size={12} />
                Ativo
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-400">
                <UserX size={12} />
                Inativo
              </span>
            )}
            <span className={`inline-flex items-center rounded-full bg-surface px-2 py-0.5 text-xs font-medium ${currentPlanMeta?.color || "text-muted"}`}>
              {currentPlanMeta?.label || "Free"}
            </span>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            disabled={actionLoading}
            onClick={toggleActive}
          >
            {user.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
            {user.is_active ? "Desativar" : "Ativar"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={actionLoading}
            onClick={toggleRole}
          >
            <Shield size={14} />
            {user.role === "super_admin" ? "Remover Admin" : "Promover"}
          </Button>
          <Button
            variant="danger"
            size="sm"
            disabled={actionLoading}
            onClick={deleteUser}
          >
            <Trash2 size={14} />
            Excluir
          </Button>
        </div>
      </div>

      {/* Plan selector */}
      <div className="mb-8 rounded-xl border border-border bg-surface p-4">
        <h3 className="mb-3 text-sm font-semibold text-muted uppercase tracking-wider">
          Plano
        </h3>
        <div className="flex gap-2 flex-wrap">
          {USER_PLANS.map((p) => (
            <button
              key={p.value}
              disabled={actionLoading}
              onClick={() => changePlan(p.value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors border ${
                user.plan === p.value
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-muted hover:bg-elevated hover:text-primary"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center gap-2 text-muted">
            <FileText size={16} />
            <span className="text-xs font-medium">Formulários</span>
          </div>
          <p className="mt-2 text-2xl font-semibold">{user.forms.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center gap-2 text-muted">
            <Inbox size={16} />
            <span className="text-xs font-medium">Respostas</span>
          </div>
          <p className="mt-2 text-2xl font-semibold">{user.submission_count}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center gap-2 text-muted">
            <Layers size={16} />
            <span className="text-xs font-medium">Workspaces</span>
          </div>
          <p className="mt-2 text-2xl font-semibold">{user.workspaces.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center gap-2 text-muted">
            <span className="text-xs font-medium">Membro desde</span>
          </div>
          <p className="mt-2 text-lg font-semibold">
            {new Date(user.created_at).toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>

      {/* Workspaces */}
      <div className="mb-8">
        <h2 className="mb-4 text-sm font-semibold text-muted uppercase tracking-wider">
          Workspaces
        </h2>
        {user.workspaces.length === 0 ? (
          <p className="text-sm text-muted">Nenhum workspace</p>
        ) : (
          <div className="space-y-2">
            {user.workspaces.map((ws) => (
              <div
                key={ws.id}
                className="flex items-center justify-between rounded-lg border border-border/50 bg-surface p-3"
              >
                <div>
                  <span className="text-sm font-medium">{ws.name}</span>
                  <p className="text-xs text-muted">/{ws.slug}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Forms list */}
      <div>
        <h2 className="mb-4 text-sm font-semibold text-muted uppercase tracking-wider">
          Formulários
        </h2>
        {user.forms.length === 0 ? (
          <p className="text-sm text-muted">Nenhum formulário criado</p>
        ) : (
          <div className="space-y-2">
            {user.forms.map((form) => (
              <div
                key={form.id}
                className="flex items-center justify-between rounded-lg border border-border/50 bg-surface p-3"
              >
                <div>
                  <span className="text-sm font-medium">{form.title}</span>
                  <p className="text-xs text-muted">
                    Atualizado em{" "}
                    {new Date(form.updated_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    form.status === "published"
                      ? "bg-green-500/10 text-green-400"
                      : form.status === "draft"
                      ? "bg-yellow-500/10 text-yellow-400"
                      : "bg-muted/10 text-muted"
                  }`}
                >
                  {form.status === "published"
                    ? "Publicado"
                    : form.status === "draft"
                    ? "Rascunho"
                    : form.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
