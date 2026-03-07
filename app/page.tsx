import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Brain,
  BarChart3,
  Shield,
  Zap,
  Check,
  X,
  ArrowRight,
  Star,
  Crown,
  Building2,
  Rocket,
  Clock,
  FileText,
  MousePointerClick,
  Eye,
  ChevronRight,
  ShieldCheck,
  Server,
  MessageCircle,
  CreditCard,
  Globe,
  Lock,
  HelpCircle,
} from "lucide-react";

// ══════════════════════════════════════════════════════════════════════
// DATA
// ══════════════════════════════════════════════════════════════════════

const TRUST_BADGES = [
  { icon: CreditCard, label: "Sem cartão de crédito" },
  { icon: Clock, label: "Pronto em 30 segundos" },
  { icon: Shield, label: "LGPD inclusa" },
  { icon: Server, label: "Self-hosted disponível" },
  { icon: Globe, label: "Suporte em português" },
];

const METRICS = [
  { value: "28+", label: "tipos de campos profissionais" },
  { value: "<60s", label: "para gerar um formulário com IA" },
  { value: "6", label: "bundles prontos incluindo LGPD" },
  { value: "R$0", label: "para começar. Sem prazo." },
];

const PAIN_POINTS = [
  {
    persona: "Pesquisador",
    pain: "Perco 3 horas montando formulário e meu orientador ainda pede diferencial semântico.",
    solution: "Descreva sua pesquisa em uma frase. A IA gera o formulário completo — com campos que seu orientador vai aprovar.",
    icon: FileText,
  },
  {
    persona: "Consultoria",
    pain: "Pago milhares por ano em ferramentas enterprise e uso 10% das funcionalidades.",
    solution: "Todos os campos avançados por uma fração do preço. Sem contrato anual.",
    icon: Building2,
  },
  {
    persona: "Agência",
    pain: "Minha pesquisa foi invalidada por viés de ordem nas perguntas.",
    solution: "Detecção automática de order bias antes de publicar. Única ferramenta do mercado com isso.",
    icon: Eye,
  },
];

const STEPS = [
  {
    number: "01",
    title: "Descreva o que precisa",
    description:
      'Escreva em português simples: "Pesquisa de satisfação para clientes B2B do setor agro". A IA entende contexto, público e objetivo.',
    icon: MessageCircle,
  },
  {
    number: "02",
    title: "Revise e publique",
    description:
      "A IA gera campos, validações e lógica condicional. Ajuste no editor visual ou publique direto.",
    icon: MousePointerClick,
  },
  {
    number: "03",
    title: "Analise com inteligência",
    description:
      "Dashboard com taxa de conclusão, drop-off por página e análise de sentimento com IA. Os dados chegam; os insights, também.",
    icon: BarChart3,
  },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: "Descreva em português. A IA entrega pronto.",
    description:
      "Não é um plugin. A IA é o motor do produto. Descreva seu objetivo e receba um formulário completo — com campos certos, validações e lógica condicional.",
  },
  {
    icon: Brain,
    title: "Campos que seu orientador vai aprovar.",
    description:
      "Matriz Likert, diferencial semântico, ranking, soma constante, verificação de atenção, NPS. Campos que consultorias cobram milhares para configurar.",
  },
  {
    icon: Eye,
    title: "A única ferramenta que detecta order bias.",
    description:
      "Exclusivo no mercado. A IA analisa a sequência das perguntas e aponta vieses de funil, correlação e sensibilidade antes de você publicar.",
  },
  {
    icon: BarChart3,
    title: "Saiba onde abandonam — e por quê.",
    description:
      "Analytics com IA embarcada. Taxa de conclusão, drop-off por página, análise de sentimento. Não apenas gráficos — respostas sobre o que os dados significam.",
  },
  {
    icon: Shield,
    title: "LGPD pronto. Sem advogado.",
    description:
      "Bundle de consentimento com base legal, finalidade e direitos do titular. Um clique e seu formulário está em compliance.",
  },
  {
    icon: Zap,
    title: "Teste com 10 antes de enviar para 10.000.",
    description:
      "Modo piloto para validar seu formulário com um grupo pequeno. Corrija problemas antes do lançamento real.",
  },
];

const PRICE_ANCHOR = [
  { feature: "Formulários avançados", tool: "Plataformas enterprise", cost: "R$625/mês" },
  { feature: "Builder visual", tool: "Form builders premium", cost: "R$415/mês" },
  { feature: "Analytics de pesquisa", tool: "Ferramentas de survey", cost: "R$375/mês" },
  { feature: "Detecção de viés", tool: "Consultor externo", cost: "R$2.000/projeto" },
  { feature: "LGPD compliance", tool: "Assessoria jurídica", cost: "R$3.000/setup" },
  { feature: "Geração com IA", tool: "—", cost: "Não existe" },
];

const PLANS: {
  key: string;
  label: string;
  price: number;
  anchor?: string;
  description: string;
  icon: typeof Star;
  color: string;
  bg: string;
  popular?: boolean;
  features: string[];
}[] = [
  {
    key: "free",
    label: "Starter",
    price: 0,
    description: "Para seu primeiro projeto",
    icon: Rocket,
    color: "text-muted",
    bg: "bg-muted/10",
    features: [
      "3 formulários com IA",
      "100 respostas/mês",
      "3 gerações IA/mês",
      "Analytics básico",
      "LGPD compliance",
      "Templates inclusos",
    ],
  },
  {
    key: "pro",
    label: "Pro",
    price: 29.9,
    anchor: "Menos de R$1/dia",
    description: "Para pesquisadores e freelancers",
    icon: Zap,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    features: [
      "25 formulários",
      "1.000 respostas/mês",
      "50 gerações IA/mês",
      "Lógica condicional",
      "Temas customizados",
      "Modo piloto",
      "Exportação completa",
    ],
  },
  {
    key: "business",
    label: "Business",
    price: 99.9,
    anchor: "98% mais barato que ferramentas enterprise",
    description: "Para equipes que faturam com pesquisa",
    icon: Crown,
    color: "text-accent",
    bg: "bg-accent/10",
    popular: true,
    features: [
      "100 formulários",
      "10.000 respostas/mês",
      "500 gerações IA/mês",
      "Campos avançados",
      "Detecção de order bias",
      "Analytics com IA",
      "Sem marca d'água",
    ],
  },
  {
    key: "enterprise",
    label: "Enterprise",
    price: 299.9,
    description: "Para controle total e compliance",
    icon: Building2,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    features: [
      "Tudo ilimitado",
      "Self-hosted (Docker)",
      "API completa",
      "Suporte dedicado",
      "Treinamento de equipe",
      "SLA 99.9%",
    ],
  },
];

const COMPARISON: {
  label: string;
  free: string | boolean;
  pro: string | boolean;
  business: string | boolean;
  enterprise: string | boolean;
}[] = [
  { label: "Formulários", free: "3", pro: "25", business: "100", enterprise: "Ilimitado" },
  { label: "Respostas / mês", free: "100", pro: "1.000", business: "10.000", enterprise: "Ilimitado" },
  { label: "Upload de arquivos", free: "5 MB", pro: "25 MB", business: "100 MB", enterprise: "500 MB" },
  { label: "Gerações com IA / mês", free: "3", pro: "50", business: "500", enterprise: "Ilimitado" },
  { label: "Temas customizados", free: false, pro: true, business: true, enterprise: true },
  { label: "Lógica condicional", free: false, pro: true, business: true, enterprise: true },
  { label: "Campos avançados", free: false, pro: false, business: true, enterprise: true },
  { label: "Modo piloto", free: false, pro: true, business: true, enterprise: true },
  { label: "Exportação de dados", free: false, pro: true, business: true, enterprise: true },
  { label: "Sem marca d'água", free: false, pro: false, business: true, enterprise: true },
];

const FAQ = [
  {
    q: "Precisa de cartão de crédito?",
    a: "Não. O plano Starter é gratuito de verdade — sem cartão, sem prazo, sem pegadinha.",
  },
  {
    q: "Meus dados ficam onde?",
    a: "Em infraestrutura segura com Supabase. No plano Enterprise, você pode hospedar no seu próprio servidor com Docker.",
  },
  {
    q: "Funciona para pesquisa acadêmica?",
    a: "Sim. Temos campos validados como matriz Likert, diferencial semântico, ranking, soma constante e verificação de atenção — tudo que pesquisa científica exige.",
  },
  {
    q: "E se eu ultrapassar o limite de respostas?",
    a: "Avisamos quando estiver perto do limite. Suas respostas nunca são perdidas — você pode fazer upgrade a qualquer momento.",
  },
  {
    q: "Tem LGPD?",
    a: "Built-in. Bundle de consentimento com base legal, finalidade e direitos do titular pronto para usar. Um clique.",
  },
  {
    q: "Posso hospedar no meu servidor?",
    a: "Sim. O plano Enterprise inclui Docker com deploy completo. Seus dados, seu servidor, seu controle total.",
  },
];

// ══════════════════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════════════════

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-primary">
      {/* ─── Nav ─── */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo-horizontal.svg"
              alt="eximIA"
              width={120}
              height={26}
              className="opacity-90"
            />
            <div className="h-6 w-px bg-muted/30" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                Forms
              </span>
              <div className="mt-0.5 h-[2px] w-full rounded-full bg-accent" />
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/login"
              className="hidden text-sm text-muted transition-colors hover:text-primary sm:block"
            >
              Entrar
            </Link>
            <Link
              href="/dashboard/register"
              className="group flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black transition-all hover:bg-accent-hover hover:shadow-glow-accent"
            >
              Começar grátis
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-64 -top-64 h-[700px] w-[700px] rounded-full bg-accent/[0.04] blur-[120px]" />
          <div className="absolute -bottom-64 -right-64 h-[700px] w-[700px] rounded-full bg-accent-alt/[0.03] blur-[120px]" />
        </div>
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative mx-auto max-w-4xl px-6 pb-16 pt-20 text-center md:pb-24 md:pt-28">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 backdrop-blur-sm">
            <Sparkles size={13} className="text-accent" />
            <span className="text-xs font-medium text-accent">
              Única ferramenta com detecção de order bias
            </span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 font-display text-4xl font-semibold leading-[1.15] tracking-tight md:text-5xl lg:text-6xl">
            Pesquisa profissional.
            <br />
            <span className="text-accent">Sem complicação.</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-cream-dim md:text-xl">
            Descreva seu objetivo em uma frase. A IA monta o formulário completo
            — com campos avançados, detecção de viés e analytics que mostram o
            que os dados realmente dizem.
          </p>

          {/* CTAs */}
          <div className="mb-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard/register"
              className="group inline-flex items-center gap-2.5 rounded-xl bg-accent px-7 py-3.5 text-sm font-semibold text-black shadow-glow-accent transition-all hover:bg-accent-hover hover:shadow-lg"
            >
              Criar meu primeiro formulário
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              href="#como-funciona"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3.5 text-sm font-medium text-muted transition-colors hover:border-border-hover hover:text-primary"
            >
              Ver como funciona
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {TRUST_BADGES.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-1.5 text-xs text-muted"
              >
                <badge.icon size={12} className="text-accent/60" />
                <span>{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Social Proof Metrics ─── */}
      <section className="border-y border-border/50 bg-surface/50">
        <div className="mx-auto grid max-w-5xl grid-cols-2 divide-x divide-border/30 md:grid-cols-4">
          {METRICS.map((metric) => (
            <div key={metric.label} className="px-6 py-8 text-center">
              <div className="mb-1.5 font-display text-2xl font-semibold text-accent md:text-3xl">
                {metric.value}
              </div>
              <div className="text-xs text-muted leading-relaxed">
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Pain Points ─── */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-4 text-center">
            <span className="text-xs font-medium uppercase tracking-widest text-accent">
              Você se identifica?
            </span>
          </div>
          <h2 className="mb-12 text-center font-display text-2xl font-semibold md:text-3xl">
            Problemas que não precisam mais existir
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {PAIN_POINTS.map((point) => (
              <div
                key={point.persona}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-surface p-6 transition-all hover:border-accent/20 hover:shadow-glow-accent"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                    <point.icon size={16} className="text-accent" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                    {point.persona}
                  </span>
                </div>
                <p className="mb-4 text-sm italic leading-relaxed text-muted">
                  &ldquo;{point.pain}&rdquo;
                </p>
                <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
                <p className="mt-4 text-sm leading-relaxed text-cream-dim">
                  {point.solution}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section
        id="como-funciona"
        className="border-y border-border/50 bg-surface/30 py-20 md:py-24"
      >
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-4 text-center">
            <span className="text-xs font-medium uppercase tracking-widest text-accent">
              Simples assim
            </span>
          </div>
          <h2 className="mb-3 text-center font-display text-2xl font-semibold md:text-3xl">
            Do briefing ao insight em 3 passos
          </h2>
          <p className="mb-14 text-center text-muted">
            Você foca na pergunta certa. A IA cuida do resto.
          </p>

          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.number} className="relative">
                <div className="mb-5 flex items-center gap-3">
                  <span className="font-display text-3xl font-semibold text-accent/30">
                    {step.number}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-accent/5">
                    <step.icon size={18} className="text-accent" />
                  </div>
                </div>
                <h3 className="mb-2 text-sm font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-4 text-center">
            <span className="text-xs font-medium uppercase tracking-widest text-accent">
              Diferenciais
            </span>
          </div>
          <h2 className="mb-3 text-center font-display text-2xl font-semibold md:text-3xl">
            O que você ganha — e o que a concorrência cobra à parte
          </h2>
          <p className="mb-14 text-center text-muted">
            Campos avançados de pesquisa, compliance e IA de verdade. Tudo
            incluso.
          </p>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-border/50 bg-surface/80 p-6 transition-all hover:border-accent/20 hover:bg-surface"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 transition-colors group-hover:bg-accent/15">
                  <feature.icon size={18} className="text-accent" />
                </div>
                <h3 className="mb-2 text-sm font-semibold leading-snug">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Price Anchoring ─── */}
      <section className="border-y border-border/50 bg-surface/30 py-20 md:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-4 text-center">
            <span className="text-xs font-medium uppercase tracking-widest text-accent">
              Faça as contas
            </span>
          </div>
          <h2 className="mb-3 text-center font-display text-2xl font-semibold md:text-3xl">
            Quanto você pagaria por tudo isso separado?
          </h2>
          <p className="mb-10 text-center text-muted">
            O eximIA Forms substitui um ecossistema inteiro de ferramentas.
          </p>

          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-5 py-3 text-left font-medium text-muted">
                    Funcionalidade
                  </th>
                  <th className="px-5 py-3 text-left font-medium text-muted">
                    Alternativa
                  </th>
                  <th className="px-5 py-3 text-right font-medium text-muted">
                    Custo
                  </th>
                </tr>
              </thead>
              <tbody>
                {PRICE_ANCHOR.map((row) => (
                  <tr
                    key={row.feature}
                    className="border-b border-border/30 last:border-0"
                  >
                    <td className="px-5 py-3 font-medium">{row.feature}</td>
                    <td className="px-5 py-3 text-muted">{row.tool}</td>
                    <td className="px-5 py-3 text-right text-muted">
                      {row.cost}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border bg-surface">
                  <td className="px-5 py-3 font-semibold" colSpan={2}>
                    Total separado
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-muted line-through">
                    R$6.415+/mês
                  </td>
                </tr>
                <tr className="bg-accent/5">
                  <td className="px-5 py-4 font-semibold text-accent" colSpan={2}>
                    eximIA Forms Business
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-lg font-bold text-accent">
                      R$99,90/mês
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p className="mt-4 text-center text-xs text-muted">
            Economia de 96%. Mesmas funcionalidades. Uma única ferramenta.
          </p>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-4 text-center">
            <span className="text-xs font-medium uppercase tracking-widest text-accent">
              Planos
            </span>
          </div>
          <h2 className="mb-3 text-center font-display text-2xl font-semibold md:text-3xl">
            Preço justo. Escala real.
          </h2>
          <p className="mb-14 text-center text-muted">
            Planos pensados para o mercado brasileiro. Comece grátis e cresça sem
            surpresas.
          </p>

          {/* Plan cards */}
          <div className="mb-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((plan) => (
              <div
                key={plan.key}
                className={`relative rounded-2xl border p-6 transition-all ${
                  plan.popular
                    ? "border-accent/40 bg-accent/[0.03] shadow-glow-accent"
                    : "border-border/50 bg-surface hover:border-border-hover"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-black">
                    Mais popular
                  </div>
                )}

                <div
                  className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${plan.bg}`}
                >
                  <plan.icon size={18} className={plan.color} />
                </div>

                <h3 className="text-lg font-semibold">{plan.label}</h3>
                <p className="mb-4 text-xs text-muted">{plan.description}</p>

                <div className="mb-1">
                  {plan.price === 0 ? (
                    <span className="text-3xl font-bold">Grátis</span>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">R${plan.price.toFixed(2).replace(".", ",")}</span>
                      <span className="text-sm text-muted">/mês</span>
                    </div>
                  )}
                </div>
                {plan.anchor && (
                  <p className="mb-4 text-[11px] text-accent">{plan.anchor}</p>
                )}
                {!plan.anchor && <div className="mb-4" />}

                <Link
                  href="/dashboard/register"
                  className={`mb-6 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                    plan.popular
                      ? "bg-accent text-black hover:bg-accent-hover shadow-glow-accent"
                      : "border border-border text-muted hover:border-border-hover hover:text-primary"
                  }`}
                >
                  {plan.price === 0
                    ? "Começar grátis"
                    : "Começar agora"}
                  <ArrowRight size={14} />
                </Link>

                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check
                        size={14}
                        className="mt-0.5 shrink-0 text-accent/70"
                      />
                      <span className="text-cream-dim">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Comparison table */}
          <div className="overflow-x-auto rounded-xl border border-border/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-5 py-3 text-left font-medium text-muted">
                    Feature
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-muted">
                    Starter
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-muted">
                    Pro
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-accent">
                    Business
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-muted">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr
                    key={row.label}
                    className="border-b border-border/30 last:border-0"
                  >
                    <td className="px-5 py-3 font-medium">{row.label}</td>
                    {(
                      ["free", "pro", "business", "enterprise"] as const
                    ).map((plan) => {
                      const val = row[plan];
                      return (
                        <td
                          key={plan}
                          className={`px-4 py-3 text-center ${
                            plan === "business" ? "bg-accent/[0.03]" : ""
                          }`}
                        >
                          {typeof val === "boolean" ? (
                            val ? (
                              <Check
                                size={16}
                                className="mx-auto text-green-400"
                              />
                            ) : (
                              <X
                                size={16}
                                className="mx-auto text-muted/30"
                              />
                            )
                          ) : (
                            <span>{val}</span>
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
      </section>

      {/* ─── Guarantee ─── */}
      <section className="border-y border-border/50 bg-surface/30 py-16">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
            <ShieldCheck size={24} className="text-accent" />
          </div>
          <h2 className="mb-3 font-display text-xl font-semibold md:text-2xl">
            Garantia incondicional de 14 dias
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-cream-dim">
            Teste o eximIA Forms por 14 dias. Se você não concordar que é a
            forma mais rápida de criar formulários de pesquisa, devolvemos 100%
            do valor. Sem perguntas. Sem burocracia.
          </p>
          <p className="text-xs text-muted">
            E se pedir reembolso, pode continuar usando o plano Starter para
            sempre. Você não perde nada.
          </p>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-2xl px-6">
          <div className="mb-4 text-center">
            <span className="text-xs font-medium uppercase tracking-widest text-accent">
              Dúvidas?
            </span>
          </div>
          <h2 className="mb-10 text-center font-display text-2xl font-semibold md:text-3xl">
            Perguntas frequentes
          </h2>

          <div className="space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-border/50 bg-surface/80 transition-colors open:border-accent/20 open:bg-surface"
              >
                <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
                  <span>{item.q}</span>
                  <ChevronRight
                    size={16}
                    className="shrink-0 text-muted transition-transform group-open:rotate-90"
                  />
                </summary>
                <div className="px-5 pb-4 text-sm leading-relaxed text-muted">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="relative overflow-hidden border-t border-border/50 py-20 md:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-accent/[0.03] blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <h2 className="mb-4 font-display text-2xl font-semibold md:text-3xl">
            Sua próxima pesquisa merece mais <br className="hidden sm:block" />
            do que formulários genéricos.
          </h2>
          <p className="mb-8 text-muted">
            Crie uma conta gratuita em 30 segundos. Sem cartão de crédito, sem
            período de teste — o plano Starter é gratuito de verdade.
          </p>
          <Link
            href="/dashboard/register"
            className="group inline-flex items-center gap-2.5 rounded-xl bg-accent px-8 py-3.5 text-sm font-semibold text-black shadow-glow-accent transition-all hover:bg-accent-hover hover:shadow-lg"
          >
            Começar agora — é grátis
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border/50 py-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <Image
                src="/logo-horizontal.svg"
                alt="eximIA"
                width={90}
                height={20}
                className="opacity-70"
              />
              <div className="h-5 w-px bg-muted/20" />
              <div className="flex flex-col items-start">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/60">
                  Forms
                </span>
                <div className="mt-0.5 h-[2px] w-full rounded-full bg-accent/50" />
              </div>
            </div>
            <div className="flex items-center gap-6 text-xs text-muted">
              <Link href="/dashboard/login" className="hover:text-primary transition-colors">
                Entrar
              </Link>
              <Link href="/dashboard/register" className="hover:text-primary transition-colors">
                Criar conta
              </Link>
              <Link href="#pricing" className="hover:text-primary transition-colors">
                Planos
              </Link>
            </div>
          </div>
          <div className="mt-6 border-t border-border/30 pt-6 text-center text-xs text-muted/60">
            &copy; {new Date().getFullYear()} eximIA. Todos os direitos
            reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
