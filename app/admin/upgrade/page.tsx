"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, X, Zap, Loader2, Crown, Star, Building2, Rocket, CreditCard, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui";
import type { UserPlan } from "@/lib/types";
import type { PlanUsage } from "@/lib/plans";

const PLAN_META: Record<UserPlan, { label: string; icon: typeof Star; color: string; bg: string; description: string }> = {
  free: { label: "Free", icon: Rocket, color: "text-muted", bg: "bg-muted/10", description: "Para experimentar" },
  pro: { label: "Pro", icon: Zap, color: "text-blue-400", bg: "bg-blue-500/10", description: "Para profissionais" },
  business: { label: "Business", icon: Crown, color: "text-accent", bg: "bg-accent/10", description: "Para equipes" },
  enterprise: { label: "Enterprise", icon: Building2, color: "text-purple-400", bg: "bg-purple-500/10", description: "Para empresas" },
};

const PRICING: Record<UserPlan, number> = {
  free: 0,
  pro: 29.9,
  business: 99.9,
  enterprise: 299.9,
};

const FEATURES: { label: string; values: Record<UserPlan, string | boolean> }[] = [
  { label: "Formulários", values: { free: "3", pro: "25", business: "100", enterprise: "Ilimitado" } },
  { label: "Respostas / mês", values: { free: "100", pro: "1.000", business: "10.000", enterprise: "Ilimitado" } },
  { label: "Upload de arquivos", values: { free: "5 MB", pro: "25 MB", business: "100 MB", enterprise: "500 MB" } },
  { label: "Gerações com IA / mês", values: { free: "3", pro: "50", business: "500", enterprise: "Ilimitado" } },
  { label: "Temas customizados", values: { free: false, pro: true, business: true, enterprise: true } },
  { label: "Lógica condicional", values: { free: false, pro: true, business: true, enterprise: true } },
  { label: "Campos avançados", values: { free: false, pro: false, business: true, enterprise: true } },
  { label: "Modo piloto", values: { free: false, pro: true, business: true, enterprise: true } },
  { label: "Exportação de dados", values: { free: false, pro: true, business: true, enterprise: true } },
  { label: "Sem marca d'água", values: { free: false, pro: false, business: true, enterprise: true } },
];

function UpgradeContent() {
  const [usage, setUsage] = useState<PlanUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const searchParams = useSearchParams();

  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  useEffect(() => {
    async function fetchUsage() {
      const res = await fetch("/api/v1/usage");
      if (res.ok) setUsage(await res.json());
      setLoading(false);
    }
    fetchUsage();
  }, []);

  async function handleCheckout(plan: UserPlan) {
    if (plan === "free") return;
    setCheckoutLoading(plan);

    try {
      const res = await fetch("/api/billing/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Erro ao criar sessão de pagamento");
      }
    } catch {
      alert("Erro de conexão. Tente novamente.");
    } finally {
      setCheckoutLoading(null);
    }
  }

  async function handlePortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Erro ao abrir portal de billing");
      }
    } catch {
      alert("Erro de conexão. Tente novamente.");
    } finally {
      setPortalLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted" />
      </div>
    );
  }

  const currentPlan = usage?.plan || "free";
  const plans: UserPlan[] = ["free", "pro", "business", "enterprise"];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Success / Cancel banners */}
      {success && (
        <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-center text-sm text-green-400">
          Plano ativado com sucesso! Aproveite todos os recursos.
        </div>
      )}
      {canceled && (
        <div className="mb-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-center text-sm text-yellow-400">
          Checkout cancelado. Você pode tentar novamente quando quiser.
        </div>
      )}

      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">Escolha seu plano</h1>
        <p className="text-muted">
          Desbloqueie todo o potencial do eximIA Forms
        </p>
      </div>

      {/* Current usage bar */}
      {usage && (
        <div className="mb-8 rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Seu uso atual — Plano {PLAN_META[currentPlan].label}</span>
            {currentPlan !== "free" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePortal}
                disabled={portalLoading}
                className="gap-1.5 text-xs"
              >
                {portalLoading ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <CreditCard size={12} />
                )}
                Gerenciar assinatura
                <ExternalLink size={10} />
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <div className="flex justify-between text-xs text-muted mb-1">
                <span>Formulários: {usage.formsUsed} / {usage.limits.maxForms === Infinity ? "∞" : usage.limits.maxForms}</span>
                <span>{usage.formsPercent}%</span>
              </div>
              <div className="h-2 rounded-full bg-elevated overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${usage.formsPercent >= 90 ? "bg-red-400" : usage.formsPercent >= 70 ? "bg-yellow-400" : "bg-accent"}`}
                  style={{ width: `${Math.min(100, usage.formsPercent)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted mb-1">
                <span>Respostas: {usage.submissionsThisMonth} / {usage.limits.maxSubmissionsPerMonth === Infinity ? "∞" : (usage.limits.maxSubmissionsPerMonth ?? 0).toLocaleString("pt-BR")}</span>
                <span>{usage.submissionsPercent}%</span>
              </div>
              <div className="h-2 rounded-full bg-elevated overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${usage.submissionsPercent >= 90 ? "bg-red-400" : usage.submissionsPercent >= 70 ? "bg-yellow-400" : "bg-accent"}`}
                  style={{ width: `${Math.min(100, usage.submissionsPercent)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted mb-1">
                <span>Gerações IA: {usage.aiGenerationsThisMonth} / {usage.limits.aiGenerationsPerMonth === Infinity ? "∞" : usage.limits.aiGenerationsPerMonth}</span>
                <span>{usage.aiGenerationsPercent}%</span>
              </div>
              <div className="h-2 rounded-full bg-elevated overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${usage.aiGenerationsPercent >= 90 ? "bg-red-400" : usage.aiGenerationsPercent >= 70 ? "bg-yellow-400" : "bg-accent"}`}
                  style={{ width: `${Math.min(100, usage.aiGenerationsPercent)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plan cards */}
      <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const meta = PLAN_META[plan];
          const price = PRICING[plan];
          const isCurrent = plan === currentPlan;
          const isPopular = plan === "business";
          const Icon = meta.icon;
          const isUpgrade = plans.indexOf(plan) > plans.indexOf(currentPlan);
          const isCheckingOut = checkoutLoading === plan;

          return (
            <div
              key={plan}
              className={`relative rounded-2xl border p-5 transition-colors ${
                isCurrent
                  ? "border-accent bg-accent/5"
                  : isPopular
                  ? "border-accent/50 bg-surface"
                  : "border-border bg-surface"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-black">
                  Popular
                </div>
              )}

              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${meta.bg} mb-4`}>
                <Icon size={20} className={meta.color} />
              </div>

              <h3 className="text-lg font-semibold">{meta.label}</h3>
              <p className="text-xs text-muted mb-4">{meta.description}</p>

              <div className="mb-5">
                {price === 0 ? (
                  <span className="text-2xl font-bold">Grátis</span>
                ) : (
                  <div>
                    <span className="text-2xl font-bold">R${price.toFixed(2).replace(".", ",")}</span>
                    <span className="text-sm text-muted">/mês</span>
                  </div>
                )}
              </div>

              {isCurrent ? (
                <Button variant="outline" size="sm" disabled className="w-full">
                  Plano atual
                </Button>
              ) : plan === "free" ? (
                <Button variant="outline" size="sm" disabled className="w-full text-muted">
                  —
                </Button>
              ) : (
                <Button
                  variant={isPopular ? "primary" : "outline"}
                  size="sm"
                  className="w-full gap-1.5"
                  disabled={isCheckingOut}
                  onClick={() => {
                    if (currentPlan !== "free" && !isUpgrade) {
                      handlePortal();
                    } else {
                      handleCheckout(plan);
                    }
                  }}
                >
                  {isCheckingOut ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : isUpgrade ? (
                    "Fazer upgrade"
                  ) : (
                    "Gerenciar plano"
                  )}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Feature comparison table */}
      <div>
        <h2 className="mb-4 text-sm font-semibold text-muted uppercase tracking-wider text-center">
          Comparação detalhada
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="px-4 py-3 text-left font-medium text-muted">Feature</th>
                {plans.map((plan) => (
                  <th key={plan} className={`px-4 py-3 text-center font-medium ${plan === currentPlan ? "text-accent" : "text-muted"}`}>
                    {PLAN_META[plan].label}
                    {plan === currentPlan && <span className="block text-[10px] font-normal">Atual</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feature) => (
                <tr key={feature.label} className="border-b border-border/50">
                  <td className="px-4 py-3 font-medium">{feature.label}</td>
                  {plans.map((plan) => {
                    const val = feature.values[plan];
                    return (
                      <td key={plan} className={`px-4 py-3 text-center ${plan === currentPlan ? "bg-accent/5" : ""}`}>
                        {typeof val === "boolean" ? (
                          val ? (
                            <Check size={16} className="mx-auto text-green-400" />
                          ) : (
                            <X size={16} className="mx-auto text-muted/30" />
                          )
                        ) : (
                          <span className="text-sm">{val}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function UpgradePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted" />
        </div>
      }
    >
      <UpgradeContent />
    </Suspense>
  );
}
