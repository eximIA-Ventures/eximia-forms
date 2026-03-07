"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Input } from "@/components/ui";
import { ArrowRight, UserPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin/onboarding";

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (authError) {
      setError(authError.message === "User already registered"
        ? "Este email já está cadastrado"
        : "Erro ao criar conta. Tente novamente.");
      setLoading(false);
      return;
    }

    // Send welcome email (fire-and-forget)
    fetch("/api/auth/welcome", { method: "POST" }).catch(() => {});

    router.push(redirect);
    router.refresh();
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-primary/80">
          Nome completo
        </label>
        <Input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Seu nome"
          required
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-primary/80">
          Email
        </label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          required
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-primary/80">
          Senha
        </label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          required
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-primary/80">
          Confirmar senha
        </label>
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repita a senha"
          required
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full gap-2">
        {loading ? (
          "Criando conta..."
        ) : (
          <>
            Criar conta
            <ArrowRight size={16} />
          </>
        )}
      </Button>

      <p className="text-center text-sm text-muted">
        Já tem uma conta?{" "}
        <Link
          href="/admin/login"
          className="text-accent hover:text-accent/80 transition-colors"
        >
          Entrar
        </Link>
      </p>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg p-4 overflow-hidden">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-accent/[0.02] blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo + branding */}
        <div className="mb-10 flex items-center justify-center gap-3">
          <Image
            src="/logo-horizontal.svg"
            alt="eximIA"
            width={180}
            height={38}
            priority
          />
          <div className="h-7 w-px bg-muted/30" />
          <div className="flex flex-col items-start">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
              Forms
            </span>
            <div className="mt-0.5 h-[2px] w-full rounded-full bg-accent" />
          </div>
        </div>

        {/* Register card */}
        <div className="rounded-2xl border border-border/60 bg-surface/80 backdrop-blur-sm p-6 sm:p-8 shadow-2xl shadow-black/20">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <UserPlus size={18} className="text-accent" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Criar conta</h1>
              <p className="text-xs text-muted">Preencha seus dados para começar</p>
            </div>
          </div>

          <Suspense
            fallback={
              <div className="text-center text-sm text-muted py-8">
                Carregando...
              </div>
            }
          >
            <RegisterForm />
          </Suspense>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted/50">
          eximIA Forms &middot; AI-first form builder
        </p>
      </div>
    </div>
  );
}
