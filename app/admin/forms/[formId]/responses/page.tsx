"use client";

import { useEffect, useState, useRef, use, Fragment } from "react";
import Link from "next/link";
import { Button, Badge } from "@/components/ui";
import {
  ArrowLeft,
  Download,
  Eye,
  Calendar,
  ChevronDown,
  ChevronUp,
  Users,
  Clock,
  TrendingUp,
  BarChart3,
  Pencil,
  ExternalLink,
  FileText,
  FileDown,
  FileSpreadsheet,
  FileJson,
  Hash,
  Star,
  Copy,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import type { FormSubmission, Form, FormElement } from "@/lib/types";
import { cn } from "@/lib/utils";

type TabKey = "overview" | "responses";

const LAYOUT_TYPES = ["heading", "paragraph", "divider"];
const CHOICE_TYPES = ["select", "radio", "multiselect", "checkbox"];
const NUMERIC_TYPES = ["rating", "nps", "scale", "number"];

export default function ResponsesPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = use(params);
  const [form, setForm] = useState<Form | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function load() {
      const [formRes, subRes] = await Promise.all([
        fetch(`/api/v1/forms/${formId}`),
        fetch(`/api/v1/forms/${formId}/submissions`),
      ]);

      if (formRes.ok) setForm(await formRes.json());
      if (subRes.ok) {
        const data = await subRes.json();
        setSubmissions(data.data || []);
        setTotal(data.total || 0);
      }
      setLoading(false);
    }
    load();
  }, [formId]);

  // Get all answerable fields
  const fields = form?.schema.pages
    .flatMap((p) => p.elements)
    .filter((el) => !LAYOUT_TYPES.includes(el.type)) || [];

  // Computed stats
  const avgDuration = submissions.length > 0
    ? submissions.reduce((acc, s) => acc + (s.metadata?.duration_ms || 0), 0) /
      submissions.length
    : 0;

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisWeek = submissions.filter(
    (s) => new Date(s.created_at) >= weekAgo
  ).length;

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const today = submissions.filter(
    (s) => new Date(s.created_at) >= todayStart
  ).length;

  // ── Export helpers ──────────────────────────────────────────────

  function getExportRows() {
    return submissions.map((sub) => ({
      id: sub.id.slice(0, 8),
      data: new Date(sub.created_at).toLocaleString("pt-BR"),
      ...Object.fromEntries(
        fields.map((f) => {
          const val = sub.data[f.id];
          if (val === undefined || val === null) return [f.label, ""];
          if (Array.isArray(val)) return [f.label, val.join(", ")];
          return [f.label, String(val)];
        })
      ),
    }));
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportCSV() {
    if (!form || submissions.length === 0) return;
    const headers = ["ID", "Data", ...fields.map((f) => f.label)];
    const rows = submissions.map((sub) => [
      sub.id.slice(0, 8),
      new Date(sub.created_at).toLocaleString("pt-BR"),
      ...fields.map((f) => {
        const val = sub.data[f.id];
        if (val === undefined || val === null) return "";
        if (Array.isArray(val)) return val.join(", ");
        return String(val);
      }),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    downloadBlob(blob, `${form.slug}-respostas.csv`);
  }

  function exportJSON() {
    if (!form || submissions.length === 0) return;
    const data = {
      form: { id: form.id, title: form.title, slug: form.slug },
      exportedAt: new Date().toISOString(),
      total: submissions.length,
      responses: getExportRows(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    downloadBlob(blob, `${form.slug}-respostas.json`);
  }

  async function exportPDF() {
    if (!form || submissions.length === 0) return;
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(form.title, 14, 18);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(
      `${submissions.length} resposta${submissions.length !== 1 ? "s" : ""} · Exportado em ${new Date().toLocaleDateString("pt-BR")}`,
      14,
      25
    );

    // Table
    const headers = ["#", "Data", ...fields.map((f) => f.label)];
    const rows = submissions.map((sub, i) => [
      String(i + 1),
      new Date(sub.created_at).toLocaleString("pt-BR"),
      ...fields.map((f) => {
        const val = sub.data[f.id];
        if (val === undefined || val === null) return "";
        if (Array.isArray(val)) return val.join(", ");
        return String(val);
      }),
    ]);

    autoTable(doc, {
      startY: 30,
      head: [headers],
      body: rows,
      styles: { fontSize: 8, cellPadding: 3, overflow: "linebreak" },
      headStyles: {
        fillColor: [196, 168, 130],
        textColor: [10, 10, 10],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 14, right: 14 },
    });

    // Footer on each page
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Página ${i} de ${totalPages}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: "center" }
      );
      doc.text(
        "eximIA Forms",
        pageWidth - 14,
        doc.internal.pageSize.getHeight() - 8,
        { align: "right" }
      );
    }

    doc.save(`${form.slug}-respostas.pdf`);
  }

  function exportExcel() {
    if (!form || submissions.length === 0) return;
    const headers = ["ID", "Data", ...fields.map((f) => f.label)];
    const rows = submissions.map((sub) => [
      sub.id.slice(0, 8),
      new Date(sub.created_at).toLocaleString("pt-BR"),
      ...fields.map((f) => {
        const val = sub.data[f.id];
        if (val === undefined || val === null) return "";
        if (Array.isArray(val)) return val.join(", ");
        return String(val);
      }),
    ]);

    const escape = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:spreadsheet" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8" /></head>
      <body>
        <table border="1">
          <thead><tr>${headers.map((h) => `<th style="font-weight:bold;background:#f0f0f0">${escape(h)}</th>`).join("")}</tr></thead>
          <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escape(String(cell))}</td>`).join("")}</tr>`).join("")}</tbody>
        </table>
      </body></html>`;

    const blob = new Blob([html], {
      type: "application/vnd.ms-excel;charset=utf-8",
    });
    downloadBlob(blob, `${form.slug}-respostas.xls`);
  }

  async function deleteSubmission(submissionId: string) {
    if (!confirm("Tem certeza que deseja excluir esta resposta?")) return;

    const res = await fetch(
      `/api/v1/forms/${formId}/submissions/${submissionId}`,
      { method: "DELETE" }
    );
    if (res.ok) {
      setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
      setTotal((prev) => prev - 1);
      if (expandedId === submissionId) setExpandedId(null);
    }
  }

  function copyLink() {
    if (!form) return;
    navigator.clipboard.writeText(
      `${window.location.origin}/f/${form.slug}`
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-muted">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <span className="text-sm">Carregando respostas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/forms"
            className="rounded-lg p-2 text-muted hover:bg-elevated hover:text-primary transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold">
              {form?.title || "Respostas"}
            </h1>
            <div className="mt-0.5 flex items-center gap-3 text-sm text-muted">
              <span>
                {total} resposta{total !== 1 ? "s" : ""}
              </span>
              {form?.status && (
                <Badge
                  variant={
                    form.status === "published" ? "success" : "default"
                  }
                >
                  {form.status === "published"
                    ? "Publicado"
                    : form.status === "draft"
                    ? "Rascunho"
                    : form.status}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {form?.status === "published" && (
            <Button variant="outline" size="sm" onClick={copyLink}>
              {copiedLink ? (
                <CheckCircle2 size={14} className="text-success" />
              ) : (
                <Copy size={14} />
              )}
              {copiedLink ? "Copiado!" : "Copiar link"}
            </Button>
          )}
          <Link href={`/admin/forms/${formId}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil size={14} />
              Editar
            </Button>
          </Link>
          <ExportDropdown
            disabled={submissions.length === 0}
            onExportPDF={exportPDF}
            onExportCSV={exportCSV}
            onExportJSON={exportJSON}
            onExportExcel={exportExcel}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total de respostas"
          value={total}
          icon={Users}
          color="text-accent"
          bgColor="bg-accent/10"
        />
        <StatCard
          label="Esta semana"
          value={thisWeek}
          icon={TrendingUp}
          color="text-success"
          bgColor="bg-success/10"
        />
        <StatCard
          label="Hoje"
          value={today}
          icon={BarChart3}
          color="text-info"
          bgColor="bg-info/10"
        />
        <StatCard
          label="Tempo médio"
          value={
            avgDuration > 0
              ? `${Math.round(avgDuration / 1000)}s`
              : "—"
          }
          icon={Clock}
          color="text-warning"
          bgColor="bg-warning/10"
        />
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-elevated/50 p-1 w-fit">
        {[
          { key: "overview" as TabKey, label: "Visão Geral", icon: BarChart3 },
          { key: "responses" as TabKey, label: "Respostas", icon: FileText },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-all",
              activeTab === tab.key
                ? "bg-surface text-primary shadow-sm"
                : "text-muted hover:text-primary"
            )}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-20 text-center">
          <div className="mb-4 rounded-2xl bg-accent/10 p-5">
            <Eye size={36} className="text-accent" />
          </div>
          <p className="text-lg font-semibold">Nenhuma resposta ainda</p>
          <p className="mt-1 max-w-xs text-sm text-muted">
            As respostas e estatísticas aparecerão aqui quando o formulário for
            preenchido
          </p>
          {form?.status === "published" && (
            <Button variant="outline" size="sm" className="mt-4" onClick={copyLink}>
              <Copy size={14} />
              Copiar link do formulário
            </Button>
          )}
        </div>
      ) : activeTab === "overview" ? (
        <OverviewTab fields={fields} submissions={submissions} />
      ) : (
        <ResponsesTab
          form={form}
          fields={fields}
          submissions={submissions}
          expandedId={expandedId}
          setExpandedId={setExpandedId}
          onDelete={deleteSubmission}
        />
      )}
    </div>
  );
}

/* ─── Overview Tab ─── */

function OverviewTab({
  fields,
  submissions,
}: {
  fields: FormElement[];
  submissions: FormSubmission[];
}) {
  // Separate field types
  const choiceFields = fields.filter((f) => CHOICE_TYPES.includes(f.type) || f.type === "radio");
  const numericFields = fields.filter((f) => NUMERIC_TYPES.includes(f.type));
  const textFields = fields.filter(
    (f) =>
      !CHOICE_TYPES.includes(f.type) &&
      !NUMERIC_TYPES.includes(f.type) &&
      !LAYOUT_TYPES.includes(f.type)
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Choice-based fields — bar charts */}
      {choiceFields.map((field) => (
        <ChoiceChart
          key={field.id}
          field={field}
          submissions={submissions}
        />
      ))}

      {/* Numeric fields — distribution */}
      {numericFields.map((field) => (
        <NumericChart
          key={field.id}
          field={field}
          submissions={submissions}
        />
      ))}

      {/* Text fields — recent answers */}
      {textFields.map((field) => (
        <TextSummary
          key={field.id}
          field={field}
          submissions={submissions}
        />
      ))}

      {/* Timeline */}
      <div className="lg:col-span-2">
        <TimelineChart submissions={submissions} />
      </div>
    </div>
  );
}

/* ─── Choice Chart (horizontal bars) ─── */

function ChoiceChart({
  field,
  submissions,
}: {
  field: FormElement;
  submissions: FormSubmission[];
}) {
  // Count occurrences
  const counts: Record<string, number> = {};

  for (const sub of submissions) {
    const val = sub.data[field.id];
    if (val === undefined || val === null) continue;

    if (Array.isArray(val)) {
      for (const v of val) counts[String(v)] = (counts[String(v)] || 0) + 1;
    } else {
      counts[String(val)] = (counts[String(val)] || 0) + 1;
    }
  }

  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const maxCount = Math.max(...entries.map(([, c]) => c), 1);
  const answered = submissions.filter(
    (s) => s.data[field.id] !== undefined && s.data[field.id] !== null
  ).length;

  if (entries.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">{field.label}</h3>
          <p className="text-xs text-muted">{answered} respostas</p>
        </div>
        <div className="rounded-lg bg-accent/10 p-2">
          <BarChart3 size={14} className="text-accent" />
        </div>
      </div>
      <div className="space-y-3">
        {entries.map(([label, count]) => {
          const pct = Math.round((count / answered) * 100);
          return (
            <div key={label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="truncate pr-2 font-medium">{label}</span>
                <span className="shrink-0 text-muted">
                  {count} ({pct}%)
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-elevated">
                <div
                  className="h-2.5 rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Numeric Chart (avg + distribution) ─── */

function NumericChart({
  field,
  submissions,
}: {
  field: FormElement;
  submissions: FormSubmission[];
}) {
  const values = submissions
    .map((s) => s.data[field.id])
    .filter((v) => v !== undefined && v !== null)
    .map(Number)
    .filter((n) => !isNaN(n));

  if (values.length === 0) return null;

  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);

  // Distribution
  const counts: Record<number, number> = {};
  for (const v of values) counts[v] = (counts[v] || 0) + 1;
  const sortedKeys = Object.keys(counts)
    .map(Number)
    .sort((a, b) => a - b);
  const maxCount = Math.max(...Object.values(counts), 1);

  // NPS specific
  const isNps = field.type === "nps";
  let npsScore = 0;
  let detractors = 0;
  let passives = 0;
  let promoters = 0;
  if (isNps && values.length > 0) {
    for (const v of values) {
      if (v <= 6) detractors++;
      else if (v <= 8) passives++;
      else promoters++;
    }
    npsScore = Math.round(
      ((promoters - detractors) / values.length) * 100
    );
  }

  const isRating = field.type === "rating";

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">{field.label}</h3>
          <p className="text-xs text-muted">{values.length} respostas</p>
        </div>
        <div className="rounded-lg bg-warning/10 p-2">
          {isRating ? (
            <Star size={14} className="text-warning" />
          ) : (
            <Hash size={14} className="text-warning" />
          )}
        </div>
      </div>

      {/* Summary stats */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-elevated/50 p-3 text-center">
          <p className="text-lg font-bold">{avg.toFixed(1)}</p>
          <p className="text-[10px] text-muted">Média</p>
        </div>
        <div className="rounded-lg bg-elevated/50 p-3 text-center">
          <p className="text-lg font-bold">{min}</p>
          <p className="text-[10px] text-muted">Mínimo</p>
        </div>
        <div className="rounded-lg bg-elevated/50 p-3 text-center">
          <p className="text-lg font-bold">{max}</p>
          <p className="text-[10px] text-muted">Máximo</p>
        </div>
      </div>

      {/* NPS Score */}
      {isNps && (
        <div className="mb-4 rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted">NPS Score</span>
            <span
              className={cn(
                "text-2xl font-bold",
                npsScore >= 50
                  ? "text-success"
                  : npsScore >= 0
                  ? "text-warning"
                  : "text-danger"
              )}
            >
              {npsScore}
            </span>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-danger" />
              Detratores: {detractors}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-warning" />
              Neutros: {passives}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-success" />
              Promotores: {promoters}
            </span>
          </div>
          {/* NPS bar */}
          <div className="mt-2 flex h-3 overflow-hidden rounded-full">
            <div
              className="bg-danger"
              style={{
                width: `${(detractors / values.length) * 100}%`,
              }}
            />
            <div
              className="bg-warning"
              style={{
                width: `${(passives / values.length) * 100}%`,
              }}
            />
            <div
              className="bg-success"
              style={{
                width: `${(promoters / values.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Distribution bars */}
      <div className="flex items-end gap-1" style={{ height: 80 }}>
        {sortedKeys.map((key) => {
          const count = counts[key];
          const height = (count / maxCount) * 100;
          const isNpsColored = isNps;
          let barColor = "bg-accent";
          if (isNpsColored) {
            if (key <= 6) barColor = "bg-danger/70";
            else if (key <= 8) barColor = "bg-warning/70";
            else barColor = "bg-success/70";
          }

          return (
            <div
              key={key}
              className="flex flex-1 flex-col items-center gap-1"
            >
              <span className="text-[9px] text-muted">{count}</span>
              <div
                className={cn("w-full rounded-t", barColor)}
                style={{ height: `${Math.max(height, 4)}%` }}
              />
              <span className="text-[9px] text-muted">{key}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Text Summary ─── */

function TextSummary({
  field,
  submissions,
}: {
  field: FormElement;
  submissions: FormSubmission[];
}) {
  const answers = submissions
    .map((s) => ({
      value: s.data[field.id],
      date: s.created_at,
    }))
    .filter((a) => a.value !== undefined && a.value !== null && a.value !== "")
    .slice(0, 5);

  if (answers.length === 0) return null;

  const totalAnswered = submissions.filter(
    (s) =>
      s.data[field.id] !== undefined &&
      s.data[field.id] !== null &&
      s.data[field.id] !== ""
  ).length;

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">{field.label}</h3>
          <p className="text-xs text-muted">{totalAnswered} respostas</p>
        </div>
        <div className="rounded-lg bg-info/10 p-2">
          <FileText size={14} className="text-info" />
        </div>
      </div>
      <div className="space-y-2">
        {answers.map((a, i) => (
          <div
            key={i}
            className="rounded-lg bg-elevated/50 px-3 py-2.5 text-sm"
          >
            <p className="break-words">
              {Array.isArray(a.value) ? a.value.join(", ") : String(a.value)}
            </p>
            <p className="mt-1 text-[10px] text-muted/60">
              {new Date(a.date).toLocaleDateString("pt-BR")}
            </p>
          </div>
        ))}
        {totalAnswered > 5 && (
          <p className="text-center text-xs text-muted">
            +{totalAnswered - 5} respostas
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Timeline Chart ─── */

function toLocalDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function TimelineChart({
  submissions,
}: {
  submissions: FormSubmission[];
}) {
  // Group by day (last 14 days) using local timezone
  const days = 14;
  const now = new Date();
  const todayKey = toLocalDateKey(now);
  const dayMap: Record<string, number> = {};

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dayMap[toLocalDateKey(d)] = 0;
  }

  for (const sub of submissions) {
    const key = toLocalDateKey(new Date(sub.created_at));
    if (key in dayMap) dayMap[key]++;
  }

  const entries = Object.entries(dayMap);
  const maxVal = Math.max(...Object.values(dayMap), 1);

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Respostas por dia</h3>
          <p className="text-xs text-muted">Últimos {days} dias</p>
        </div>
        <div className="rounded-lg bg-accent-alt/10 p-2">
          <TrendingUp size={14} className="text-accent-alt" />
        </div>
      </div>
      <div className="flex items-end gap-1.5" style={{ height: 120 }}>
        {entries.map(([date, count]) => {
          const height = maxVal > 0 ? (count / maxVal) * 100 : 0;
          const d = new Date(date + "T12:00:00");
          const dayLabel = d.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
          });
          const isToday = date === todayKey;

          return (
            <div
              key={date}
              className="group relative flex flex-1 flex-col items-center gap-1"
            >
              {/* Tooltip */}
              <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-surface border border-border px-2 py-1 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-10">
                {count} resposta{count !== 1 ? "s" : ""} &middot; {dayLabel}
              </div>
              <div
                className={cn(
                  "w-full rounded-t transition-all",
                  isToday ? "bg-accent" : "bg-accent/40",
                  count === 0 && "bg-elevated"
                )}
                style={{ height: `${Math.max(height, 3)}%` }}
              />
              <span
                className={cn(
                  "text-[8px]",
                  isToday ? "text-accent font-medium" : "text-muted/50"
                )}
              >
                {d.toLocaleDateString("pt-BR", { day: "2-digit" })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Responses Tab (table) ─── */

function ResponsesTab({
  form,
  fields,
  submissions,
  expandedId,
  setExpandedId,
  onDelete,
}: {
  form: Form | null;
  fields: FormElement[];
  submissions: FormSubmission[];
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  onDelete: (submissionId: string) => void;
}) {
  return (
    <div className="rounded-xl border border-border overflow-x-auto">
      <table className="w-full min-w-[480px]">
        <thead>
          <tr className="border-b border-border bg-elevated/50">
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted">
              #
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted">
              Data
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted">
              Resumo
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-muted" />
          </tr>
        </thead>
        <tbody>
          {submissions.map((sub, index) => {
            const isExpanded = expandedId === sub.id;
            const firstValues = Object.entries(sub.data).slice(0, 3);

            return (
              <Fragment key={sub.id}>
                <tr
                  className="border-b border-border hover:bg-elevated/30 cursor-pointer transition-colors"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : sub.id)
                  }
                >
                  <td className="px-4 py-3 text-sm text-muted">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-muted" />
                      {new Date(sub.created_at).toLocaleString("pt-BR")}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted truncate max-w-xs">
                    {firstValues
                      .map(([, v]) => String(v))
                      .join(" · ")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isExpanded ? (
                      <ChevronUp
                        size={16}
                        className="inline text-muted"
                      />
                    ) : (
                      <ChevronDown
                        size={16}
                        className="inline text-muted"
                      />
                    )}
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="bg-elevated/20">
                    <td colSpan={4} className="px-4 py-4">
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {fields.map((el) => {
                          const val = sub.data[el.id];
                          return (
                            <div
                              key={el.id}
                              className="rounded-lg bg-surface/50 px-3 py-2.5"
                            >
                              <p className="text-xs font-medium text-muted">
                                {el.label}
                              </p>
                              <p className="mt-0.5 text-sm break-words">
                                {val === undefined || val === null
                                  ? "—"
                                  : Array.isArray(val)
                                  ? val.join(", ")
                                  : String(val)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex gap-4 text-xs text-muted">
                          {sub.metadata?.duration_ms && (
                            <span className="flex items-center gap-1">
                              <Clock size={10} />
                              Tempo:{" "}
                              {Math.round(sub.metadata.duration_ms / 1000)}s
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(sub.id);
                          }}
                          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-danger hover:bg-danger/10 transition-colors"
                        >
                          <Trash2 size={12} />
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Export Dropdown ─── */

function ExportDropdown({
  disabled,
  onExportPDF,
  onExportCSV,
  onExportJSON,
  onExportExcel,
}: {
  disabled: boolean;
  onExportPDF: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onExportExcel: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const items = [
    { label: "PDF", description: "Documento formatado para impressao", icon: FileDown, action: onExportPDF },
    { label: "CSV", description: "Compativel com Excel e Sheets", icon: FileText, action: onExportCSV },
    { label: "Excel", description: "Arquivo .xls com formatacao", icon: FileSpreadsheet, action: onExportExcel },
    { label: "JSON", description: "Dados estruturados para integracoes", icon: FileJson, action: onExportJSON },
  ];

  return (
    <div ref={ref} className="relative">
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="gap-1.5"
      >
        <Download size={14} />
        Exportar
        <ChevronDown size={12} className={cn("transition-transform", open && "rotate-180")} />
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-xl border border-border bg-surface p-1 shadow-xl">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                item.action();
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-elevated"
            >
              <item.icon size={16} className="shrink-0 text-muted" />
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-[11px] text-muted">{item.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Stat Card ─── */

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted">{label}</span>
        <div className={cn("rounded-lg p-2", bgColor)}>
          <Icon size={14} className={color} />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}
