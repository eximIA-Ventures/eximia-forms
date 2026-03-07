"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/lib/auth/use-user-role";
import {
  Globe,
  Users,
  FileText,
  Inbox,
  Layers,
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  UserPlus,
  Activity,
} from "lucide-react";

interface GlobalStats {
  total_users: number;
  total_forms: number;
  total_submissions: number;
  total_workspaces: number;
  active_users: number;
  users_by_plan: Record<string, number>;
  new_users_this_month: number;
  new_users_last_month: number;
  user_growth_percent: number;
  mrr_brl: number;
  mrr_usd: number;
  submissions_this_month: number;
  submissions_last_month: number;
  submissions_growth_percent: number;
  recent_forms: {
    id: string;
    title: string;
    status: string;
    updated_at: string;
    form_workspaces: {
      name: string;
      owner_id: string;
      user_profiles: { email: string; full_name: string | null } | null;
    } | null;
  }[];
}

const PLAN_COLORS: Record<string, { label: string; color: string; bg: string }> = {
  free: { label: "Free", color: "text-muted", bg: "bg-muted/20" },
  pro: { label: "Pro", color: "text-blue-400", bg: "bg-blue-500/20" },
  business: { label: "Business", color: "text-accent", bg: "bg-accent/20" },
  enterprise: { label: "Enterprise", color: "text-purple-400", bg: "bg-purple-500/20" },
};

export default function GlobalDashboardPage() {
  const { isSuperAdmin, loading: roleLoading } = useUserRole();
  const router = useRouter();
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleLoading && !isSuperAdmin) router.push("/admin");
  }, [roleLoading, isSuperAdmin, router]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    async function fetchStats() {
      const res = await fetch("/api/v1/admin/stats");
      if (res.ok) setStats(await res.json());
      setLoading(false);
    }
    fetchStats();
  }, [isSuperAdmin]);

  if (roleLoading || loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-center text-muted">Erro ao carregar dados</div>
    );
  }

  const primaryCards = [
    {
      label: "MRR (projeção)",
      value: `R$ ${stats.mrr_brl.toLocaleString("pt-BR")}`,
      subValue: `US$ ${stats.mrr_usd.toLocaleString("en-US")}`,
      icon: DollarSign,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      label: "Usuários",
      value: stats.total_users,
      subValue: `${stats.active_users} ativos`,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Novos este mês",
      value: stats.new_users_this_month,
      subValue: stats.user_growth_percent > 0
        ? `+${stats.user_growth_percent}%`
        : stats.user_growth_percent < 0
        ? `${stats.user_growth_percent}%`
        : "—",
      icon: UserPlus,
      color: "text-accent",
      bg: "bg-accent/10",
      trend: stats.user_growth_percent,
    },
    {
      label: "Respostas este mês",
      value: stats.submissions_this_month.toLocaleString("pt-BR"),
      subValue: stats.submissions_growth_percent > 0
        ? `+${stats.submissions_growth_percent}%`
        : stats.submissions_growth_percent < 0
        ? `${stats.submissions_growth_percent}%`
        : "—",
      icon: Activity,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      trend: stats.submissions_growth_percent,
    },
  ];

  const secondaryCards = [
    { label: "Formulários", value: stats.total_forms, icon: FileText, color: "text-accent", bg: "bg-accent/10" },
    { label: "Respostas (total)", value: stats.total_submissions, icon: Inbox, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Workspaces", value: stats.total_workspaces, icon: Layers, color: "text-purple-400", bg: "bg-purple-500/10" },
  ];

  const totalPlanUsers = Object.values(stats.users_by_plan).reduce((a, b) => a + b, 0);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
          <Globe size={20} className="text-accent" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Visão Global</h1>
          <p className="text-sm text-muted">Métricas SaaS de todos os workspaces</p>
        </div>
      </div>

      {/* Primary metrics */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {primaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <div className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bg}`}>
                <card.icon size={16} className={card.color} />
              </div>
              <span className="text-xs font-medium text-muted">{card.label}</span>
            </div>
            <p className="mt-3 text-2xl font-semibold">{card.value}</p>
            <div className="mt-1 flex items-center gap-1">
              {"trend" in card && card.trend !== undefined && card.trend !== 0 && (
                card.trend > 0
                  ? <TrendingUp size={12} className="text-green-400" />
                  : <TrendingDown size={12} className="text-red-400" />
              )}
              <span className={`text-xs ${
                "trend" in card && card.trend !== undefined
                  ? card.trend > 0 ? "text-green-400" : card.trend < 0 ? "text-red-400" : "text-muted"
                  : "text-muted"
              }`}>
                {card.subValue}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary + Plan distribution */}
      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Secondary cards */}
        <div className="grid grid-cols-3 gap-4">
          {secondaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-border bg-surface p-4"
            >
              <div className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bg}`}>
                  <card.icon size={16} className={card.color} />
                </div>
              </div>
              <p className="mt-3 text-2xl font-semibold">{card.value}</p>
              <span className="text-xs text-muted">{card.label}</span>
            </div>
          ))}
        </div>

        {/* Plan distribution */}
        <div className="rounded-xl border border-border bg-surface p-4">
          <h3 className="mb-4 text-sm font-semibold text-muted uppercase tracking-wider">
            Distribuição por plano
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.users_by_plan).map(([plan, count]) => {
              const meta = PLAN_COLORS[plan] || PLAN_COLORS.free;
              const percent = totalPlanUsers > 0 ? Math.round((count / totalPlanUsers) * 100) : 0;
              return (
                <div key={plan}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={`font-medium ${meta.color}`}>{meta.label}</span>
                    <span className="text-muted">{count} ({percent}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-elevated overflow-hidden">
                    <div
                      className={`h-full rounded-full ${meta.bg}`}
                      style={{ width: `${Math.max(2, percent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent forms */}
      <div>
        <h2 className="mb-4 text-sm font-semibold text-muted uppercase tracking-wider">
          Formulários Recentes (todos os workspaces)
        </h2>
        {stats.recent_forms.length === 0 ? (
          <p className="text-sm text-muted">Nenhum formulário encontrado</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-4 py-3 text-left font-medium text-muted">Formulário</th>
                  <th className="px-4 py-3 text-left font-medium text-muted">Proprietário</th>
                  <th className="px-4 py-3 text-left font-medium text-muted">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted">Atualizado</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_forms.map((form) => {
                  const owner = form.form_workspaces?.user_profiles;
                  return (
                    <tr
                      key={form.id}
                      className="border-b border-border/50 hover:bg-elevated/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">{form.title}</td>
                      <td className="px-4 py-3 text-muted">
                        {owner?.full_name || owner?.email || "—"}
                      </td>
                      <td className="px-4 py-3">
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
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">
                        {new Date(form.updated_at).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
