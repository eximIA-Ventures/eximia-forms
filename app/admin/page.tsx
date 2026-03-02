"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Users,
  TrendingUp,
  ArrowRight,
  Clock,
  Eye,
  ExternalLink,
  BarChart3,
  Zap,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import type { Form, FormSubmission } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DashboardData {
  forms: Form[];
  submissionsByForm: Record<string, { total: number; recent: FormSubmission[] }>;
  loading: boolean;
}

const STATUS_MAP: Record<string, { label: string; variant: "default" | "success" | "warning" | "danger" }> = {
  draft: { label: "Rascunho", variant: "warning" },
  published: { label: "Publicado", variant: "success" },
  closed: { label: "Fechado", variant: "danger" },
  archived: { label: "Arquivado", variant: "default" },
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData>({
    forms: [],
    submissionsByForm: {},
    loading: true,
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const formsRes = await fetch("/api/v1/forms");
        if (!formsRes.ok) {
          setData((d) => ({ ...d, loading: false }));
          return;
        }
        const forms: Form[] = await formsRes.json();

        // Fetch submissions for each form in parallel
        const submissionEntries = await Promise.all(
          forms.map(async (form) => {
            try {
              const res = await fetch(`/api/v1/forms/${form.id}/submissions?limit=5`);
              if (!res.ok) return [form.id, { total: 0, recent: [] }] as const;
              const result = await res.json();
              return [
                form.id,
                { total: result.total || 0, recent: result.data || [] },
              ] as const;
            } catch {
              return [form.id, { total: 0, recent: [] }] as const;
            }
          })
        );

        setData({
          forms,
          submissionsByForm: Object.fromEntries(submissionEntries),
          loading: false,
        });
      } catch {
        setData((d) => ({ ...d, loading: false }));
      }
    }
    loadDashboard();
  }, []);

  // Computed stats
  const totalForms = data.forms.length;
  const publishedForms = data.forms.filter((f) => f.status === "published").length;
  const totalSubmissions = Object.values(data.submissionsByForm).reduce(
    (acc, s) => acc + s.total,
    0
  );

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthSubmissions = Object.values(data.submissionsByForm).reduce(
    (acc, s) =>
      acc +
      s.recent.filter((sub) => new Date(sub.created_at) >= monthStart).length,
    0
  );

  // Recent submissions across all forms (sorted by date)
  const allRecentSubmissions = data.forms
    .flatMap((form) =>
      (data.submissionsByForm[form.id]?.recent || []).map((sub) => ({
        form,
        submission: sub,
      }))
    )
    .sort(
      (a, b) =>
        new Date(b.submission.created_at).getTime() -
        new Date(a.submission.created_at).getTime()
    )
    .slice(0, 8);

  // Recent / active forms
  const recentForms = [...data.forms]
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
    .slice(0, 5);

  function copyFormLink(form: Form) {
    const url = `${window.location.origin}/f/${form.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(form.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "agora";
    if (minutes < 60) return `${minutes}min atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d atrás`;
    return new Date(dateStr).toLocaleDateString("pt-BR");
  }

  if (data.loading) {
    return (
      <div className="flex items-center justify-center py-32 text-muted">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <span className="text-sm">Carregando dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            Visão geral dos seus formulários
          </p>
        </div>
        <Link href="/admin/forms/new">
          <Button size="sm" className="gap-1.5">
            <Plus size={16} />
            Novo formulário
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total de formulários"
          value={totalForms}
          icon={FileText}
          color="text-accent"
          bgColor="bg-accent/10"
          detail={`${publishedForms} publicado${publishedForms !== 1 ? "s" : ""}`}
        />
        <StatCard
          label="Respostas totais"
          value={totalSubmissions}
          icon={Users}
          color="text-accent-alt"
          bgColor="bg-accent-alt/10"
          detail="todas os formulários"
        />
        <StatCard
          label="Formulários ativos"
          value={publishedForms}
          icon={CheckCircle2}
          color="text-success"
          bgColor="bg-success/10"
          detail="aceitando respostas"
        />
        <StatCard
          label="Este mês"
          value={thisMonthSubmissions}
          icon={TrendingUp}
          color="text-info"
          bgColor="bg-info/10"
          detail={new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column — Forms + Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Forms */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Formulários recentes</h2>
              <Link
                href="/admin/forms"
                className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover transition-colors"
              >
                Ver todos
                <ArrowRight size={12} />
              </Link>
            </div>

            {recentForms.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-border py-12 text-center">
                <FileText size={32} className="mx-auto mb-3 text-muted/30" />
                <p className="text-sm font-medium">Nenhum formulário ainda</p>
                <p className="mt-1 text-xs text-muted">
                  Crie seu primeiro formulário para começar
                </p>
                <Link href="/admin/forms/new">
                  <Button size="sm" variant="outline" className="mt-4 gap-1.5">
                    <Plus size={14} />
                    Criar formulário
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentForms.map((form) => {
                  const subs = data.submissionsByForm[form.id];
                  const status = STATUS_MAP[form.status] || STATUS_MAP.draft;

                  return (
                    <div
                      key={form.id}
                      className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-all hover:border-accent/30"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                        <FileText size={18} className="text-accent" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/forms/${form.id}/edit`}
                            className="text-sm font-medium truncate hover:text-accent transition-colors"
                          >
                            {form.title || "Sem título"}
                          </Link>
                          <Badge variant={status.variant} className="shrink-0">
                            {status.label}
                          </Badge>
                        </div>
                        <div className="mt-0.5 flex items-center gap-3 text-xs text-muted">
                          <span className="flex items-center gap-1">
                            <Users size={10} />
                            {subs?.total || 0} resposta{(subs?.total || 0) !== 1 ? "s" : ""}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {timeAgo(form.updated_at)}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {form.status === "published" && (
                          <button
                            onClick={() => copyFormLink(form)}
                            className="rounded-lg p-2 text-muted hover:bg-elevated hover:text-primary transition-colors"
                            title="Copiar link"
                          >
                            {copiedId === form.id ? (
                              <CheckCircle2 size={14} className="text-success" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        )}
                        <Link
                          href={`/admin/forms/${form.id}/responses`}
                          className="rounded-lg p-2 text-muted hover:bg-elevated hover:text-primary transition-colors"
                          title="Ver respostas"
                        >
                          <Eye size={14} />
                        </Link>
                        <Link
                          href={`/admin/forms/${form.id}/edit`}
                          className="rounded-lg p-2 text-muted hover:bg-elevated hover:text-primary transition-colors"
                          title="Editar"
                        >
                          <ExternalLink size={14} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">Ações rápidas</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <Link
                href="/admin/forms/new"
                className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-all hover:border-accent/50 hover:shadow-sm"
              >
                <div className="rounded-lg bg-accent/10 p-2.5">
                  <Plus size={18} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium">Criar formulário</p>
                  <p className="text-xs text-muted">Em branco ou com IA</p>
                </div>
              </Link>

              <Link
                href="/admin/forms"
                className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-all hover:border-accent/50 hover:shadow-sm"
              >
                <div className="rounded-lg bg-accent-alt/10 p-2.5">
                  <FileText size={18} className="text-accent-alt" />
                </div>
                <div>
                  <p className="text-sm font-medium">Meus formulários</p>
                  <p className="text-xs text-muted">Gerenciar todos</p>
                </div>
              </Link>

              <Link
                href="/admin/settings"
                className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-all hover:border-accent/50 hover:shadow-sm"
              >
                <div className="rounded-lg bg-info/10 p-2.5">
                  <Zap size={18} className="text-info" />
                </div>
                <div>
                  <p className="text-sm font-medium">Configurações</p>
                  <p className="text-xs text-muted">Workspace e integrações</p>
                </div>
              </Link>
            </div>
          </section>
        </div>

        {/* Right column — Activity Feed */}
        <div className="space-y-6">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Atividade recente</h2>
            </div>

            {allRecentSubmissions.length === 0 ? (
              <div className="rounded-xl border border-border bg-surface p-6 text-center">
                <BarChart3 size={28} className="mx-auto mb-2 text-muted/30" />
                <p className="text-sm text-muted">Nenhuma atividade ainda</p>
                <p className="mt-1 text-xs text-muted/60">
                  Respostas aparecerão aqui
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-surface">
                {allRecentSubmissions.map((item, index) => {
                  const firstValues = Object.entries(item.submission.data)
                    .slice(0, 2)
                    .map(([, v]) => String(v))
                    .join(" · ");

                  return (
                    <Link
                      key={item.submission.id}
                      href={`/admin/forms/${item.form.id}/responses`}
                      className={cn(
                        "flex items-start gap-3 p-4 transition-colors hover:bg-elevated/50",
                        index > 0 && "border-t border-border"
                      )}
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-alt/10">
                        <Users size={14} className="text-accent-alt" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">
                          {item.form.title || "Sem título"}
                        </p>
                        <p className="mt-0.5 text-xs text-muted truncate">
                          {firstValues || "Resposta recebida"}
                        </p>
                        <p className="mt-1 text-[10px] text-muted/60">
                          {timeAgo(item.submission.created_at)}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Published forms quick links */}
          {publishedForms > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold">Links públicos</h2>
              <div className="space-y-2">
                {data.forms
                  .filter((f) => f.status === "published")
                  .slice(0, 5)
                  .map((form) => (
                    <div
                      key={form.id}
                      className="flex items-center justify-between rounded-xl border border-border bg-surface p-3"
                    >
                      <span className="text-xs font-medium truncate pr-2">
                        {form.title}
                      </span>
                      <button
                        onClick={() => copyFormLink(form)}
                        className={cn(
                          "shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all",
                          copiedId === form.id
                            ? "bg-success/10 text-success"
                            : "bg-accent/10 text-accent hover:bg-accent/20"
                        )}
                      >
                        {copiedId === form.id ? "Copiado!" : "Copiar link"}
                      </button>
                    </div>
                  ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
  detail,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bgColor: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 transition-all hover:border-accent/20">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted">{label}</span>
        <div className={cn("rounded-lg p-2", bgColor)}>
          <Icon size={16} className={color} />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted">{detail}</p>
    </div>
  );
}
