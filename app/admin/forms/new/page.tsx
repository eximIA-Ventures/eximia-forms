"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Textarea } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import {
  FileText,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Loader2,
  ClipboardList,
  UserSearch,
  MessageSquareHeart,
  UserPlus,
  HelpCircle,
  CalendarCheck,
  ShoppingCart,
  BarChart3,
  Megaphone,
  Check,
  ClipboardPaste,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Category definitions ────────────────────────────────────────────
const FORM_CATEGORIES = [
  { id: "survey", label: "Pesquisa", icon: ClipboardList, description: "Coletar opiniões e dados" },
  { id: "lead_gen", label: "Captação de leads", icon: UserSearch, description: "Qualificar potenciais clientes" },
  { id: "feedback", label: "Feedback", icon: MessageSquareHeart, description: "Avaliar satisfação e sugestões" },
  { id: "registration", label: "Cadastro", icon: UserPlus, description: "Registrar pessoas ou inscrições" },
  { id: "quiz", label: "Quiz / Avaliação", icon: HelpCircle, description: "Testar conhecimento ou perfil" },
  { id: "event", label: "Evento", icon: CalendarCheck, description: "Inscrição e confirmação de presença" },
  { id: "order", label: "Pedido / Orçamento", icon: ShoppingCart, description: "Coletar pedidos ou solicitações" },
  { id: "nps", label: "NPS / Satisfação", icon: BarChart3, description: "Medir lealdade e satisfação" },
  { id: "other", label: "Outro", icon: Megaphone, description: "Descreva livremente" },
] as const;

type FormCategory = (typeof FORM_CATEGORIES)[number]["id"];

const TONE_OPTIONS = [
  { id: "formal", label: "Formal" },
  { id: "friendly", label: "Amigável" },
  { id: "casual", label: "Casual" },
  { id: "professional", label: "Profissional" },
] as const;

const LENGTH_OPTIONS = [
  { id: "short", label: "Curto", description: "1-5 campos", fields: "1-5" },
  { id: "medium", label: "Médio", description: "6-15 campos", fields: "6-15" },
  { id: "long", label: "Longo", description: "16+ campos", fields: "16+" },
] as const;

type CreationMode = "blank" | "ai" | "import";
type AiStep = "category" | "details" | "generating";

export default function NewFormPage() {
  // ── Shared state ──
  const [mode, setMode] = useState<CreationMode>("blank");
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const toast = useToast();

  // ── Blank mode state ──
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // ── AI mode state ──
  const [aiStep, setAiStep] = useState<AiStep>("category");
  const [category, setCategory] = useState<FormCategory | null>(null);
  const [tone, setTone] = useState<string>("friendly");
  const [length, setLength] = useState<string>("medium");
  const [multiplePages, setMultiplePages] = useState<boolean | null>(null);
  const [audience, setAudience] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");

  // ── Import mode state ──
  const [importText, setImportText] = useState("");

  // Reset state when switching modes
  function handleModeChange(newMode: CreationMode) {
    setMode(newMode);
    if (newMode === "ai") {
      setAiStep("category");
    }
  }

  // ── Create blank form ──
  async function handleCreateBlank() {
    setCreating(true);
    const res = await fetch("/api/v1/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title || "Formulário sem título",
        description: description || undefined,
      }),
    });

    if (res.ok) {
      const form = await res.json();
      router.push(`/admin/forms/${form.id}/edit`);
    } else {
      toast.error("Erro ao criar formulário");
      setCreating(false);
    }
  }

  // ── Generate AI form ──
  async function handleGenerateAi() {
    setCreating(true);
    setAiStep("generating");

    try {
      const aiRes = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          category,
          tone,
          length,
          multiplePages,
          audience: audience || undefined,
        }),
      });

      if (aiRes.ok) {
        const { schema } = await aiRes.json();
        const res = await fetch("/api/v1/forms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: schema.title || "Formulário gerado por IA",
            description: schema.description || "",
            schema,
          }),
        });

        if (res.ok) {
          const form = await res.json();
          router.push(`/admin/forms/${form.id}/edit`);
          return;
        }
      }
      toast.error("Erro ao gerar formulário com IA");
      setAiStep("details");
    } catch {
      toast.error("Erro ao gerar formulário com IA");
      setAiStep("details");
    }
    setCreating(false);
  }

  // ── Import questions ──
  async function handleImport() {
    if (!importText.trim()) return;
    setCreating(true);

    try {
      const aiRes = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: importText,
          mode: "import",
        }),
      });

      if (aiRes.ok) {
        const { schema } = await aiRes.json();
        const res = await fetch("/api/v1/forms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: schema.title || "Formulário importado",
            description: schema.description || "",
            schema,
          }),
        });

        if (res.ok) {
          const form = await res.json();
          router.push(`/admin/forms/${form.id}/edit`);
          return;
        }
      }
      toast.error("Erro ao importar perguntas");
    } catch {
      toast.error("Erro ao importar perguntas");
    }
    setCreating(false);
  }

  const subtitle: Record<CreationMode, string> = {
    blank: "Comece do zero e monte campo por campo",
    ai: "Descreva o que precisa e a IA cria para você",
    import: "Cole suas perguntas prontas e a IA estrutura o formulário",
  };

  // ── Render ──
  return (
    <div className="mx-auto max-w-2xl p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Novo Formulário</h1>
        <p className="mt-1 text-sm text-muted">{subtitle[mode]}</p>
      </div>

      {/* Mode selector */}
      <div className="mb-8 grid grid-cols-3 gap-3">
        <button
          onClick={() => handleModeChange("blank")}
          className={cn(
            "flex flex-col items-center gap-2 rounded-xl border p-5 transition-all",
            mode === "blank"
              ? "border-accent bg-accent/5 shadow-sm shadow-accent/10"
              : "border-border hover:border-accent/30"
          )}
        >
          <FileText
            size={24}
            className={mode === "blank" ? "text-accent" : "text-muted"}
          />
          <span className="text-sm font-medium">Em branco</span>
          <span className="text-xs text-muted">Comece do zero</span>
        </button>

        <button
          onClick={() => handleModeChange("ai")}
          className={cn(
            "flex flex-col items-center gap-2 rounded-xl border p-5 transition-all",
            mode === "ai"
              ? "border-accent bg-accent/5 shadow-sm shadow-accent/10"
              : "border-border hover:border-accent/30"
          )}
        >
          <Sparkles
            size={24}
            className={mode === "ai" ? "text-accent" : "text-muted"}
          />
          <span className="text-sm font-medium">Criar com IA</span>
          <span className="text-xs text-muted">Descreva e gere</span>
        </button>

        <button
          onClick={() => handleModeChange("import")}
          className={cn(
            "flex flex-col items-center gap-2 rounded-xl border p-5 transition-all",
            mode === "import"
              ? "border-accent bg-accent/5 shadow-sm shadow-accent/10"
              : "border-border hover:border-accent/30"
          )}
        >
          <ClipboardPaste
            size={24}
            className={mode === "import" ? "text-accent" : "text-muted"}
          />
          <span className="text-sm font-medium">Importar</span>
          <span className="text-xs text-muted">Perguntas prontas</span>
        </button>
      </div>

      {/* ═══ BLANK MODE ═══ */}
      {mode === "blank" && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Título</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Pesquisa de satisfação"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Descrição <span className="text-muted">(opcional)</span>
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o propósito do formulário"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/forms")}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateBlank} disabled={creating}>
              {creating ? "Criando..." : "Criar formulário"}
            </Button>
          </div>
        </div>
      )}

      {/* ═══ IMPORT MODE ═══ */}
      {mode === "import" && !creating && (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Cole suas perguntas
            </label>
            <Textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={`Cole suas perguntas aqui, uma por linha. Exemplos:\n\n1. Qual seu nome completo?\n2. Qual seu email?\n3. Qual sua empresa?\n4. De 0 a 10, qual a probabilidade de nos recomendar?\n5. O que podemos melhorar?\n\nDica: Se a pergunta tiver opções, liste-as:\n6. Como nos conheceu?\n   a) Google\n   b) Indicação\n   c) Redes sociais`}
              rows={12}
            />
            <p className="mt-1.5 text-[11px] text-muted">
              A IA vai detectar automaticamente o tipo de cada campo (texto, email, NPS, múltipla escolha, etc.) e organizar em páginas se necessário.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/forms")}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleImport}
              disabled={creating || !importText.trim()}
              className="gap-1.5"
            >
              <ClipboardPaste size={14} />
              Importar e criar formulário
            </Button>
          </div>
        </div>
      )}

      {/* Import loading state */}
      {mode === "import" && creating && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="relative mb-6">
            <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center">
              <ClipboardPaste size={28} className="text-accent animate-pulse" />
            </div>
            <Loader2
              size={64}
              className="absolute -inset-0 animate-spin text-accent/30"
              strokeWidth={1}
            />
          </div>
          <h2 className="text-lg font-semibold">Importando perguntas...</h2>
          <p className="mt-2 max-w-xs text-sm text-muted">
            A IA está analisando suas perguntas, detectando tipos de campo e organizando o formulário.
          </p>
          <div className="mt-6 flex gap-2">
            {["Analisando perguntas", "Detectando tipos", "Estruturando"].map(
              (step, i) => (
                <span
                  key={step}
                  className="rounded-full bg-elevated px-3 py-1 text-[10px] text-muted animate-pulse"
                  style={{ animationDelay: `${i * 0.3}s` }}
                >
                  {step}
                </span>
              )
            )}
          </div>
        </div>
      )}

      {/* ═══ AI MODE ═══ */}
      {mode === "ai" && (
        <div>
          {/* Step indicator */}
          {aiStep !== "generating" && (
            <div className="mb-6 flex items-center gap-2">
              <StepDot active={aiStep === "category"} done={aiStep === "details"} label="1" />
              <div className={cn("h-px flex-1", aiStep === "details" ? "bg-accent" : "bg-border")} />
              <StepDot active={aiStep === "details"} done={false} label="2" />
            </div>
          )}

          {/* ── Step 1: Category ── */}
          {aiStep === "category" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold">
                  Qual o objetivo do formulário?
                </h2>
                <p className="mt-0.5 text-xs text-muted">
                  Escolha a categoria mais próxima
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {FORM_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const selected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-xl border p-4 text-center transition-all",
                        selected
                          ? "border-accent bg-accent/5 shadow-sm shadow-accent/10"
                          : "border-border hover:border-accent/30 hover:bg-elevated/50"
                      )}
                    >
                      <Icon
                        size={20}
                        className={selected ? "text-accent" : "text-muted"}
                      />
                      <span className="text-xs font-medium">{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => router.push("/admin/forms")}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => setAiStep("details")}
                  disabled={!category}
                  className="gap-1.5"
                >
                  Próximo
                  <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 2: Details ── */}
          {aiStep === "details" && (
            <div className="space-y-5">
              {/* Description prompt */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold">
                  Descreva o que você precisa
                </label>
                <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder={getCategoryPlaceholder(category)}
                  rows={4}
                />
                <p className="mt-1 text-[11px] text-muted">
                  Quanto mais detalhes, melhor o resultado. Mencione campos
                  específicos se desejar.
                </p>
              </div>

              {/* Audience */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">
                  Público-alvo{" "}
                  <span className="text-muted/50">(opcional)</span>
                </label>
                <Input
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="Ex: Empresários B2B, estudantes universitários, clientes finais..."
                />
              </div>

              {/* Tone */}
              <div>
                <label className="mb-2 block text-xs font-medium text-muted">
                  Tom do formulário
                </label>
                <div className="flex flex-wrap gap-2">
                  {TONE_OPTIONS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTone(t.id)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                        tone === t.id
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border text-muted hover:border-accent/30"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Length */}
              <div>
                <label className="mb-2 block text-xs font-medium text-muted">
                  Tamanho estimado
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {LENGTH_OPTIONS.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setLength(l.id)}
                      className={cn(
                        "flex flex-col items-center gap-0.5 rounded-lg border px-3 py-2.5 transition-all",
                        length === l.id
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/30"
                      )}
                    >
                      <span
                        className={cn(
                          "text-xs font-medium",
                          length === l.id ? "text-accent" : "text-primary"
                        )}
                      >
                        {l.label}
                      </span>
                      <span className="text-[10px] text-muted">
                        {l.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Multiple pages */}
              <div>
                <label className="mb-2 block text-xs font-medium text-muted">
                  Múltiplas páginas?
                </label>
                <div className="flex gap-2">
                  {[
                    { value: null, label: "Automático" },
                    { value: true, label: "Sim" },
                    { value: false, label: "Página única" },
                  ].map((opt) => (
                    <button
                      key={String(opt.value)}
                      onClick={() => setMultiplePages(opt.value)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                        multiplePages === opt.value
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border text-muted hover:border-accent/30"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setAiStep("category")}
                  className="gap-1.5"
                >
                  <ArrowLeft size={14} />
                  Voltar
                </Button>
                <Button
                  onClick={handleGenerateAi}
                  disabled={creating || !aiPrompt.trim()}
                  className="gap-1.5"
                >
                  <Sparkles size={14} />
                  Gerar com IA
                </Button>
              </div>
            </div>
          )}

          {/* ── Generating state ── */}
          {aiStep === "generating" && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="relative mb-6">
                <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Sparkles size={28} className="text-accent animate-pulse" />
                </div>
                <Loader2
                  size={64}
                  className="absolute -inset-0 animate-spin text-accent/30"
                  strokeWidth={1}
                />
              </div>
              <h2 className="text-lg font-semibold">Gerando seu formulário...</h2>
              <p className="mt-2 max-w-xs text-sm text-muted">
                A IA está criando campos, páginas e opções baseado na sua
                descrição. Isso pode levar alguns segundos.
              </p>
              <div className="mt-6 flex gap-2">
                {["Analisando contexto", "Criando campos", "Organizando páginas"].map(
                  (step, i) => (
                    <span
                      key={step}
                      className="rounded-full bg-elevated px-3 py-1 text-[10px] text-muted animate-pulse"
                      style={{ animationDelay: `${i * 0.3}s` }}
                    >
                      {step}
                    </span>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Helper components ─────────────────────────────────────────────

function StepDot({
  active,
  done,
  label,
}: {
  active: boolean;
  done: boolean;
  label: string;
}) {
  return (
    <div
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all",
        done
          ? "bg-accent text-white"
          : active
            ? "border-2 border-accent text-accent"
            : "border border-border text-muted"
      )}
    >
      {done ? <Check size={12} /> : label}
    </div>
  );
}

// ── Category-specific placeholders ────────────────────────────────

function getCategoryPlaceholder(category: FormCategory | null): string {
  switch (category) {
    case "survey":
      return "Ex: Pesquisa de clima organizacional para funcionários. Quero medir satisfação com ambiente, liderança, benefícios e comunicação interna. Incluir escala de 1-5 e campos abertos.";
    case "lead_gen":
      return "Ex: Formulário de qualificação de leads para uma empresa SaaS. Preciso saber nome, email, cargo, tamanho da empresa, orçamento mensal e principal desafio.";
    case "feedback":
      return "Ex: Avaliação pós-atendimento do suporte ao cliente. Incluir NPS, rating de satisfação, campo de sugestões e pergunta sobre probabilidade de recompra.";
    case "registration":
      return "Ex: Cadastro de novos membros para uma comunidade de tecnologia. Coletar nome, email, área de atuação, nível de experiência e interesses.";
    case "quiz":
      return "Ex: Quiz de diagnóstico de maturidade digital para empresas. 10 perguntas sobre tecnologia, processos, cultura e dados. Formato múltipla escolha.";
    case "event":
      return "Ex: Inscrição para workshop presencial de marketing digital. Coletar dados pessoais, empresa, expectativas, restrições alimentares e preferência de horário.";
    case "order":
      return "Ex: Formulário de solicitação de orçamento para serviços de consultoria. Coletar empresa, contato, tipo de serviço, prazo desejado e detalhes do projeto.";
    case "nps":
      return "Ex: Pesquisa NPS trimestral para clientes da plataforma. Incluir nota de 0-10, motivo da nota, sugestão de melhoria e campo para indicar funcionalidades mais usadas.";
    default:
      return "Descreva o formulário que deseja criar. Seja específico sobre os campos, o público e o objetivo.";
  }
}
