"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/lib/auth/use-user-role";
import { Button, Input } from "@/components/ui";
import {
  Users,
  Search,
  Shield,
  UserCheck,
  UserX,
  MoreVertical,
  Loader2,
} from "lucide-react";
import type { UserRole, UserPlan } from "@/lib/types";
import { USER_PLANS } from "@/lib/types";

interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  plan: UserPlan;
  is_active: boolean;
  created_at: string;
  forms_count: number;
}

export default function UsersPage() {
  const { isSuperAdmin, loading: roleLoading } = useUserRole();
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | UserRole>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!roleLoading && !isSuperAdmin) {
      router.push("/admin");
    }
  }, [roleLoading, isSuperAdmin, router]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    fetchUsers();
  }, [isSuperAdmin]);

  async function fetchUsers() {
    const res = await fetch("/api/v1/admin/users");
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }

  async function toggleActive(userId: string, isActive: boolean) {
    setActionLoading(userId);
    await fetch(`/api/v1/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !isActive }),
    });
    await fetchUsers();
    setActionLoading(null);
  }

  async function toggleRole(userId: string, currentRole: UserRole) {
    setActionLoading(userId);
    const newRole = currentRole === "super_admin" ? "user" : "super_admin";
    await fetch(`/api/v1/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    await fetchUsers();
    setActionLoading(null);
  }

  async function changePlan(userId: string, plan: UserPlan) {
    setActionLoading(userId);
    await fetch(`/api/v1/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    await fetchUsers();
    setActionLoading(null);
  }

  if (roleLoading || !isSuperAdmin) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted" />
      </div>
    );
  }

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.full_name || "").toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
          <Users size={20} className="text-accent" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Usuários</h1>
          <p className="text-sm text-muted">
            {users.length} usuário{users.length !== 1 ? "s" : ""} registrado{users.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou email..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "user", "super_admin"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterRole(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filterRole === f
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:bg-elevated"
              }`}
            >
              {f === "all" ? "Todos" : f === "super_admin" ? "Admins" : "Usuários"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="px-4 py-3 text-left font-medium text-muted">
                  Usuário
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted">
                  Role
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted">
                  Plano
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted">
                  Forms
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted">
                  Criado em
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-border/50 hover:bg-elevated/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/admin/users/${u.id}`)}
                >
                  <td className="px-4 py-3">
                    <div>
                      <span className="font-medium">
                        {u.full_name || "Sem nome"}
                      </span>
                      <p className="text-xs text-muted">{u.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {u.role === "super_admin" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                        <Shield size={12} />
                        Admin
                      </span>
                    ) : (
                      <span className="text-xs text-muted">Usuário</span>
                    )}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={u.plan || "free"}
                      disabled={actionLoading === u.id}
                      onChange={(e) => changePlan(u.id, e.target.value as UserPlan)}
                      className={`rounded-lg border border-border bg-transparent px-2 py-1 text-xs font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent/50 ${
                        USER_PLANS.find((p) => p.value === u.plan)?.color || "text-muted"
                      }`}
                    >
                      {USER_PLANS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {u.is_active ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-400">
                        <UserCheck size={12} />
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-red-400">
                        <UserX size={12} />
                        Inativo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted">{u.forms_count}</td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {new Date(u.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div
                      className="inline-flex gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={actionLoading === u.id}
                        onClick={() => toggleActive(u.id, u.is_active)}
                        title={u.is_active ? "Desativar" : "Ativar"}
                      >
                        {u.is_active ? (
                          <UserX size={14} />
                        ) : (
                          <UserCheck size={14} />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={actionLoading === u.id}
                        onClick={() => toggleRole(u.id, u.role)}
                        title={
                          u.role === "super_admin"
                            ? "Remover admin"
                            : "Promover a admin"
                        }
                      >
                        <Shield size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-muted"
                  >
                    Nenhum usuário encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
