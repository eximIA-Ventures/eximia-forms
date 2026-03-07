"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [workspaceName, setWorkspaceName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreateWorkspace() {
    setLoading(true);
    // The workspace will be auto-created on first form creation
    // We just store the preferred name for later
    if (workspaceName.trim()) {
      try {
        await fetch("/api/v1/workspaces", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: workspaceName.trim() }),
        });
      } catch {
        // Non-blocking — workspace will be auto-created anyway
      }
    }
    router.push("/dashboard");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg p-4 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
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

        <div className="rounded-2xl border border-border/60 bg-surface/80 backdrop-blur-sm p-6 sm:p-8 shadow-2xl shadow-black/20">
          {step === 0 && (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
                <Sparkles size={28} className="text-accent" />
              </div>
              <h1 className="text-2xl font-semibold mb-2">
                Bem-vindo ao eximIA Forms!
              </h1>
              <p className="text-muted mb-8">
                Crie formulários inteligentes com IA em minutos.
                Vamos configurar seu workspace.
              </p>

              <div className="space-y-3 text-left mb-8">
                {[
                  "Crie formulários com IA — descreva e pronto",
                  "33 tipos de campos, incluindo avançados de pesquisa",
                  "Analytics em tempo real + análise de respostas com IA",
                  "Publique e compartilhe com um link",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span className="text-sm text-muted">{item}</span>
                  </div>
                ))}
              </div>

              <Button onClick={() => setStep(1)} className="w-full gap-2">
                Começar
                <ArrowRight size={16} />
              </Button>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-lg font-semibold mb-1">Nome do seu workspace</h2>
              <p className="text-sm text-muted mb-6">
                Pode ser o nome da sua empresa, projeto ou equipe.
              </p>

              <Input
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="Ex: Minha Empresa"
                className="mb-6"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && workspaceName.trim()) handleCreateWorkspace();
                }}
              />

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setWorkspaceName("");
                    handleCreateWorkspace();
                  }}
                  className="flex-1"
                >
                  Pular
                </Button>
                <Button
                  onClick={handleCreateWorkspace}
                  disabled={loading}
                  className="flex-1 gap-2"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      Criar workspace
                      <ArrowRight size={16} />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
