"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Play, CheckCircle, TrendingUp } from "lucide-react";

interface AnalyticsData {
  daily: Array<{
    date: string;
    views: number;
    starts: number;
    completions: number;
  }>;
  totals: { views: number; starts: number; completions: number };
  totalSubmissions: number;
  completionRate: number;
}

export default function AnalyticsPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = use(params);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/v1/forms/${formId}/analytics`);
      if (res.ok) {
        setData(await res.json());
      }
      setLoading(false);
    }
    load();
  }, [formId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted">
        Carregando...
      </div>
    );
  }

  const stats = [
    {
      label: "Visualizações",
      value: data?.totals.views || 0,
      icon: Eye,
      color: "text-info",
    },
    {
      label: "Iniciados",
      value: data?.totals.starts || 0,
      icon: Play,
      color: "text-warning",
    },
    {
      label: "Completados",
      value: data?.totals.completions || 0,
      icon: CheckCircle,
      color: "text-accent-alt",
    },
    {
      label: "Taxa de conclusão",
      value: `${data?.completionRate || 0}%`,
      icon: TrendingUp,
      color: "text-accent",
    },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard/forms" className="text-muted hover:text-primary">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Analytics</h1>
          <p className="text-sm text-muted">Últimos 30 dias</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-surface p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted">{stat.label}</span>
              <stat.icon size={16} className={stat.color} />
            </div>
            <p className="mt-2 text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Daily chart (simplified bar chart) */}
      {data?.daily && data.daily.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-sm font-semibold">Atividade diária</h2>
          <div className="flex items-end gap-1 h-40">
            {data.daily.map((day) => {
              const maxVal = Math.max(...data.daily.map((d) => d.completions), 1);
              const height = (day.completions / maxVal) * 100;
              return (
                <div
                  key={day.date}
                  className="flex-1 group relative"
                  title={`${day.date}: ${day.completions} conclusões`}
                >
                  <div
                    className="w-full rounded-t bg-accent/60 hover:bg-accent transition-colors"
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted">
            <span>{data.daily[0]?.date}</span>
            <span>{data.daily[data.daily.length - 1]?.date}</span>
          </div>
        </div>
      )}
    </div>
  );
}
