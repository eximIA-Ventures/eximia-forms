"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/lib/auth/use-user-role";
import { Button, Input } from "@/components/ui";
import {
  Layers,
  Search,
  FileText,
  User,
  Loader2,
  Trash2,
  ExternalLink,
  Edit3,
  Check,
  X,
} from "lucide-react";

interface WorkspaceRow {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  settings: Record<string, unknown>;
  user_profiles: {
    email: string;
    full_name: string | null;
    role: string;
  } | null;
  forms_count: number;
}

export default function WorkspacesPage() {
  const { isSuperAdmin, loading: roleLoading } = useUserRole();
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<WorkspaceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (!roleLoading && !isSuperAdmin) router.push("/dashboard");
  }, [roleLoading, isSuperAdmin, router]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    fetchWorkspaces();
  }, [isSuperAdmin]);

  async function fetchWorkspaces() {
    const res = await fetch("/api/v1/admin/workspaces");
    if (res.ok) setWorkspaces(await res.json());
    setLoading(false);
  }

  async function renameWorkspace(id: string) {
    if (!editName.trim()) return;
    setActionLoading(id);
    await fetch(`/api/v1/admin/workspaces/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim() }),
    });
    setEditingId(null);
    await fetchWorkspaces();
    setActionLoading(null);
  }

  async function deleteWorkspace(id: string, name: string) {
    if (!confirm(`Excluir workspace "${name}"? Todos os formulários e respostas serão perdidos. Esta ação é irreversível.`)) return;
    setActionLoading(id);
    await fetch(`/api/v1/admin/workspaces/${id}`, { method: "DELETE" });
    await fetchWorkspaces();
    setActionLoading(null);
  }

  if (roleLoading || !isSuperAdmin) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted" />
      </div>
    );
  }

  const filtered = workspaces.filter((ws) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      ws.name.toLowerCase().includes(q) ||
      ws.slug.toLowerCase().includes(q) ||
      (ws.user_profiles?.email || "").toLowerCase().includes(q) ||
      (ws.user_profiles?.full_name || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
          <Layers size={20} className="text-purple-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Workspaces</h1>
          <p className="text-sm text-muted">
            {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""} no sistema
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, slug ou proprietário..."
            className="pl-9"
          />
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
                  Workspace
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted">
                  Proprietário
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
              {filtered.map((ws) => (
                <tr
                  key={ws.id}
                  className="border-b border-border/50 hover:bg-elevated/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    {editingId === ws.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-8 text-sm"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") renameWorkspace(ws.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          autoFocus
                        />
                        <button
                          onClick={() => renameWorkspace(ws.id)}
                          className="text-green-400 hover:text-green-300"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-muted hover:text-primary"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <span className="font-medium">{ws.name}</span>
                        <p className="text-xs text-muted">/{ws.slug}</p>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <span
                        className="text-sm hover:text-accent cursor-pointer transition-colors"
                        onClick={() => router.push(`/admin/users/${ws.owner_id}`)}
                      >
                        {ws.user_profiles?.full_name || "Sem nome"}
                      </span>
                      <p className="text-xs text-muted">
                        {ws.user_profiles?.email || "—"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-muted">
                      <FileText size={14} />
                      {ws.forms_count}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {new Date(ws.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={actionLoading === ws.id}
                        onClick={() => {
                          setEditingId(ws.id);
                          setEditName(ws.name);
                        }}
                        title="Renomear"
                      >
                        <Edit3 size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={actionLoading === ws.id}
                        onClick={() => deleteWorkspace(ws.id, ws.name)}
                        title="Excluir workspace"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-muted"
                  >
                    Nenhum workspace encontrado
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
