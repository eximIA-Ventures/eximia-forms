"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Badge } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import {
  Plus,
  FileText,
  MoreVertical,
  Pencil,
  Trash2,
  BarChart3,
  Copy,
  Eye,
  Users,
  CheckCircle2,
  Search,
  ExternalLink,
  Clock,
  Layers,
} from "lucide-react";
import type { Form, FormStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_MAP: Record<
  FormStatus,
  { label: string; variant: "default" | "success" | "warning" | "danger" }
> = {
  draft: { label: "Rascunho", variant: "default" },
  published: { label: "Publicado", variant: "success" },
  closed: { label: "Encerrado", variant: "warning" },
  archived: { label: "Arquivado", variant: "danger" },
};

const FILTER_TABS = [
  { key: "all", label: "Todos" },
  { key: "published", label: "Publicados" },
  { key: "draft", label: "Rascunhos" },
  { key: "closed", label: "Encerrados" },
] as const;

type FilterKey = (typeof FILTER_TABS)[number]["key"];

export default function FormsListPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [submissionCounts, setSubmissionCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    loadForms();
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick() {
      setMenuOpen(null);
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [menuOpen]);

  async function loadForms() {
    const res = await fetch("/api/v1/forms");
    if (res.ok) {
      const data: Form[] = await res.json();
      setForms(data);

      // Fetch submission counts in parallel
      const counts = await Promise.all(
        data.map(async (form) => {
          try {
            const r = await fetch(`/api/v1/forms/${form.id}/submissions?limit=1`);
            if (!r.ok) return [form.id, 0] as const;
            const result = await r.json();
            return [form.id, result.total || 0] as const;
          } catch {
            return [form.id, 0] as const;
          }
        })
      );
      setSubmissionCounts(Object.fromEntries(counts));
    }
    setLoading(false);
  }

  async function createForm() {
    const res = await fetch("/api/v1/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Formulário sem título" }),
    });

    if (res.ok) {
      const form = await res.json();
      router.push(`/admin/forms/${form.id}/edit`);
    } else {
      toast.error("Erro ao criar formulário");
    }
  }

  async function deleteForm(id: string) {
    if (!confirm("Tem certeza que deseja excluir este formulário?")) return;

    const res = await fetch(`/api/v1/forms/${id}`, { method: "DELETE" });
    if (res.ok) {
      setForms((prev) => prev.filter((f) => f.id !== id));
      toast.success("Formulário excluído");
    } else {
      toast.error("Erro ao excluir");
    }
    setMenuOpen(null);
  }

  function copyFormLink(form: Form) {
    const url = `${window.location.origin}/f/${form.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(form.id);
    toast.info("Link copiado!");
    setTimeout(() => setCopiedId(null), 2000);
  }

  function getFieldCount(form: Form): number {
    if (!form.schema?.pages) return 0;
    return form.schema.pages
      .flatMap((p) => p.elements)
      .filter((el) => !["heading", "paragraph", "divider"].includes(el.type)).length;
  }

  function getPageCount(form: Form): number {
    return form.schema?.pages?.length || 0;
  }

  // Filter & search
  const filteredForms = forms
    .filter((f) => filter === "all" || f.status === filter)
    .filter(
      (f) =>
        !search ||
        f.title.toLowerCase().includes(search.toLowerCase()) ||
        f.description?.toLowerCase().includes(search.toLowerCase())
    )
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

  // Tab counts
  const tabCounts: Record<string, number> = {
    all: forms.length,
    published: forms.filter((f) => f.status === "published").length,
    draft: forms.filter((f) => f.status === "draft").length,
    closed: forms.filter((f) => f.status === "closed").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-muted">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <span className="text-sm">Carregando formulários...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Formulários</h1>
          <p className="mt-1 text-sm text-muted">
            {forms.length} formulário{forms.length !== 1 ? "s" : ""} criado
            {forms.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={createForm} className="gap-1.5 w-full sm:w-auto">
          <Plus size={16} />
          Novo formulário
        </Button>
      </div>

      {forms.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-24 text-center">
          <div className="mb-4 rounded-2xl bg-accent/10 p-5">
            <FileText size={40} className="text-accent" />
          </div>
          <p className="text-lg font-semibold">Nenhum formulário ainda</p>
          <p className="mt-1 max-w-xs text-sm text-muted">
            Crie seu primeiro formulário para começar a coletar respostas
          </p>
          <Button className="mt-6 gap-1.5" onClick={createForm}>
            <Plus size={16} />
            Criar formulário
          </Button>
        </div>
      ) : (
        <>
          {/* Filters + Search */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Status tabs */}
            <div className="flex gap-1 overflow-x-auto rounded-lg bg-elevated/50 p-1">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                    filter === tab.key
                      ? "bg-surface text-primary shadow-sm"
                      : "text-muted hover:text-primary"
                  )}
                >
                  {tab.label}
                  {tabCounts[tab.key] > 0 && (
                    <span className="ml-1.5 text-[10px] text-muted">
                      {tabCounts[tab.key]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar formulários..."
                className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm text-primary placeholder:text-muted/50 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/20 sm:w-64"
              />
            </div>
          </div>

          {/* Forms grid */}
          {filteredForms.length === 0 ? (
            <div className="py-16 text-center">
              <Search size={32} className="mx-auto mb-3 text-muted/30" />
              <p className="text-sm text-muted">
                Nenhum formulário encontrado
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredForms.map((form) => {
                const status = STATUS_MAP[form.status];
                const subs = submissionCounts[form.id] || 0;
                const fields = getFieldCount(form);
                const pages = getPageCount(form);

                return (
                  <div
                    key={form.id}
                    className="group relative flex flex-col rounded-xl border border-border bg-surface transition-all hover:border-accent/30 hover:shadow-md hover:shadow-black/10"
                  >
                    {/* Card header */}
                    <div className="flex-1 p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <Badge variant={status.variant}>{status.label}</Badge>

                        {/* Context menu */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpen(
                                menuOpen === form.id ? null : form.id
                              );
                            }}
                            className="rounded-md p-1.5 text-muted opacity-0 hover:bg-elevated hover:text-primary group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical size={16} />
                          </button>
                          {menuOpen === form.id && (
                            <div
                              className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border border-border bg-surface py-1 shadow-xl"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Link
                                href={`/admin/forms/${form.id}/edit`}
                                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-elevated"
                              >
                                <Pencil size={14} />
                                Editar
                              </Link>
                              <Link
                                href={`/admin/forms/${form.id}/responses`}
                                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-elevated"
                              >
                                <BarChart3 size={14} />
                                Respostas
                              </Link>
                              {form.status === "published" && (
                                <>
                                  <button
                                    onClick={() => copyFormLink(form)}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-elevated"
                                  >
                                    <Copy size={14} />
                                    Copiar link
                                  </button>
                                  <a
                                    href={`/f/${form.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-elevated"
                                  >
                                    <ExternalLink size={14} />
                                    Abrir formulário
                                  </a>
                                </>
                              )}
                              <hr className="my-1 border-border" />
                              <button
                                onClick={() => deleteForm(form.id)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger/10"
                              >
                                <Trash2 size={14} />
                                Excluir
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <Link href={`/admin/forms/${form.id}/responses`}>
                        <h3 className="font-semibold truncate hover:text-accent transition-colors">
                          {form.title || "Sem título"}
                        </h3>
                        {form.description && (
                          <p className="mt-1 text-xs text-muted line-clamp-2">
                            {form.description}
                          </p>
                        )}
                      </Link>

                      {/* Stats row */}
                      <div className="mt-4 flex items-center gap-4 text-xs text-muted">
                        <span className="flex items-center gap-1">
                          <Users size={11} />
                          {subs} resposta{subs !== 1 ? "s" : ""}
                        </span>
                        <span className="flex items-center gap-1">
                          <Layers size={11} />
                          {fields} campo{fields !== 1 ? "s" : ""}
                        </span>
                        {pages > 1 && (
                          <span className="flex items-center gap-1">
                            <FileText size={11} />
                            {pages} páginas
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card footer */}
                    <div className="flex items-center justify-between border-t border-border px-5 py-3">
                      <span className="flex items-center gap-1 text-[11px] text-muted/60">
                        <Clock size={10} />
                        {new Date(form.updated_at).toLocaleDateString("pt-BR")}
                      </span>

                      <div className="flex items-center gap-1">
                        {form.status === "published" && (
                          <button
                            onClick={() => copyFormLink(form)}
                            className="rounded-md p-1.5 text-muted hover:bg-elevated hover:text-accent transition-colors"
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
                          className="rounded-md p-1.5 text-muted hover:bg-elevated hover:text-accent transition-colors"
                          title="Ver respostas"
                        >
                          <Eye size={14} />
                        </Link>
                        <Link
                          href={`/admin/forms/${form.id}/edit`}
                          className="rounded-md p-1.5 text-muted hover:bg-elevated hover:text-accent transition-colors"
                          title="Editar"
                        >
                          <Pencil size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
