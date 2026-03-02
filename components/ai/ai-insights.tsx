"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { Sparkles, Loader2, TrendingUp, MessageSquare, ThumbsUp, Lightbulb } from "lucide-react";

interface AiInsightsProps {
  formId: string;
}

interface AnalysisResult {
  summary: string;
  themes: Array<{ name: string; count: number; description: string }>;
  sentiment: { positive: number; neutral: number; negative: number };
  insights: string[];
  npsAnalysis?: {
    promoters: number;
    passives: number;
    detractors: number;
    score: number;
  };
}

export function AiInsights({ formId }: AiInsightsProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function runAnalysis() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId, type: "full" }),
      });

      if (res.ok) {
        setAnalysis(await res.json());
      } else {
        const err = await res.json();
        toast.error(err.error || "Erro ao analisar");
      }
    } catch {
      toast.error("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-accent/20 py-12 text-center">
        <Sparkles size={32} className="mb-3 text-accent/40" />
        <p className="text-sm font-medium">Análise de IA</p>
        <p className="mt-1 max-w-xs text-xs text-muted">
          Use IA para identificar temas, sentimentos e insights nas respostas
        </p>
        <Button onClick={runAnalysis} disabled={loading} size="sm" className="mt-4">
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <Sparkles size={14} />
              Analisar respostas
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare size={16} className="text-accent" />
            Resumo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{analysis.summary}</p>
        </CardContent>
      </Card>

      {/* Sentiment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ThumbsUp size={16} className="text-accent-alt" />
            Sentimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-success">Positivo</span>
                <span>{analysis.sentiment.positive}%</span>
              </div>
              <div className="h-2 rounded-full bg-elevated">
                <div
                  className="h-2 rounded-full bg-success"
                  style={{ width: `${analysis.sentiment.positive}%` }}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-warning">Neutro</span>
                <span>{analysis.sentiment.neutral}%</span>
              </div>
              <div className="h-2 rounded-full bg-elevated">
                <div
                  className="h-2 rounded-full bg-warning"
                  style={{ width: `${analysis.sentiment.neutral}%` }}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-danger">Negativo</span>
                <span>{analysis.sentiment.negative}%</span>
              </div>
              <div className="h-2 rounded-full bg-elevated">
                <div
                  className="h-2 rounded-full bg-danger"
                  style={{ width: `${analysis.sentiment.negative}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Themes */}
      {analysis.themes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp size={16} className="text-info" />
              Temas identificados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.themes.map((theme, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-medium text-accent">
                    {theme.count}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{theme.name}</p>
                    <p className="text-xs text-muted">{theme.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      {analysis.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb size={16} className="text-warning" />
              Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.insights.map((insight, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {insight}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* NPS */}
      {analysis.npsAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">NPS Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-4xl font-bold">{analysis.npsAnalysis.score}</p>
              <div className="mt-3 flex gap-4 text-xs">
                <div className="flex-1 text-success">
                  <p className="font-semibold">{analysis.npsAnalysis.promoters}%</p>
                  <p>Promotores</p>
                </div>
                <div className="flex-1 text-warning">
                  <p className="font-semibold">{analysis.npsAnalysis.passives}%</p>
                  <p>Passivos</p>
                </div>
                <div className="flex-1 text-danger">
                  <p className="font-semibold">{analysis.npsAnalysis.detractors}%</p>
                  <p>Detratores</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button variant="ghost" size="sm" onClick={runAnalysis} disabled={loading}>
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
        Re-analisar
      </Button>
    </div>
  );
}
