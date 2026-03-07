import type { UserPlan } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ======================================================================
// PLAN LIMITS — What each tier allows
// ======================================================================

export interface PlanLimits {
  maxForms: number;
  maxSubmissionsPerMonth: number;
  maxFileUploadMB: number;
  aiGenerationsPerMonth: number;
  customThemes: boolean;
  conditionalLogic: boolean;
  advancedFields: boolean; // matrix, ranking, constant_sum, semantic_differential
  pilotMode: boolean;
  exportData: boolean;
  removeBranding: boolean;
}

export const PLAN_LIMITS: Record<UserPlan, PlanLimits> = {
  free: {
    maxForms: 3,
    maxSubmissionsPerMonth: 100,
    maxFileUploadMB: 5,
    aiGenerationsPerMonth: 3,
    customThemes: false,
    conditionalLogic: false,
    advancedFields: false,
    pilotMode: false,
    exportData: false,
    removeBranding: false,
  },
  pro: {
    maxForms: 25,
    maxSubmissionsPerMonth: 1_000,
    maxFileUploadMB: 25,
    aiGenerationsPerMonth: 50,
    customThemes: true,
    conditionalLogic: true,
    advancedFields: false,
    pilotMode: true,
    exportData: true,
    removeBranding: false,
  },
  business: {
    maxForms: 100,
    maxSubmissionsPerMonth: 10_000,
    maxFileUploadMB: 100,
    aiGenerationsPerMonth: 500,
    customThemes: true,
    conditionalLogic: true,
    advancedFields: true,
    pilotMode: true,
    exportData: true,
    removeBranding: true,
  },
  enterprise: {
    maxForms: Infinity,
    maxSubmissionsPerMonth: Infinity,
    maxFileUploadMB: 500,
    aiGenerationsPerMonth: Infinity,
    customThemes: true,
    conditionalLogic: true,
    advancedFields: true,
    pilotMode: true,
    exportData: true,
    removeBranding: true,
  },
};

// ======================================================================
// PLAN FEATURES — For display on upgrade/pricing pages
// ======================================================================

export interface PlanFeature {
  label: string;
  free: string | boolean;
  pro: string | boolean;
  business: string | boolean;
  enterprise: string | boolean;
}

export const PLAN_FEATURES: PlanFeature[] = [
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

export const PLAN_PRICING: Record<UserPlan, { brl: number; usd: number }> = {
  free: { brl: 0, usd: 0 },
  pro: { brl: 29.9, usd: 7 },
  business: { brl: 99.9, usd: 19 },
  enterprise: { brl: 299.9, usd: 59 },
};

// ======================================================================
// USAGE CHECKING — Server-side helpers
// ======================================================================

export interface PlanUsage {
  plan: UserPlan;
  limits: PlanLimits;
  formsUsed: number;
  submissionsThisMonth: number;
  aiGenerationsThisMonth: number;
  formsRemaining: number;
  submissionsRemaining: number;
  aiGenerationsRemaining: number;
  formsPercent: number;
  submissionsPercent: number;
  aiGenerationsPercent: number;
}

/** Get current plan usage for the authenticated user (server-side) */
export async function getUserPlanUsage(): Promise<PlanUsage | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();

  // Get user profile with plan
  const { data: profile } = await admin
    .from("user_profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const plan = (profile?.plan || "free") as UserPlan;
  const limits = PLAN_LIMITS[plan];

  // Count forms across user's workspaces
  const { data: workspaces } = await supabase
    .from("form_workspaces")
    .select("id")
    .eq("owner_id", user.id);

  const wsIds = (workspaces || []).map((w) => w.id);

  let formsUsed = 0;
  if (wsIds.length > 0) {
    const { count } = await supabase
      .from("forms")
      .select("id", { count: "exact", head: true })
      .in("workspace_id", wsIds);
    formsUsed = count || 0;
  }

  // Count submissions this month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  let submissionsThisMonth = 0;
  if (wsIds.length > 0) {
    const { data: formIds } = await supabase
      .from("forms")
      .select("id")
      .in("workspace_id", wsIds);

    const fIds = (formIds || []).map((f) => f.id);
    if (fIds.length > 0) {
      const { count } = await admin
        .from("form_submissions")
        .select("id", { count: "exact", head: true })
        .in("form_id", fIds)
        .gte("created_at", monthStart)
        .eq("is_complete", true);
      submissionsThisMonth = count || 0;
    }
  }

  // AI generations this month
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const { data: aiUsage } = await admin
    .from("ai_usage")
    .select("generation_count")
    .eq("user_id", user.id)
    .eq("month", currentMonth)
    .single();

  const aiGenerationsThisMonth = aiUsage?.generation_count || 0;

  const formsRemaining = Math.max(0, limits.maxForms - formsUsed);
  const submissionsRemaining = Math.max(0, limits.maxSubmissionsPerMonth - submissionsThisMonth);
  const aiGenerationsRemaining = Math.max(0, limits.aiGenerationsPerMonth - aiGenerationsThisMonth);

  return {
    plan,
    limits,
    formsUsed,
    submissionsThisMonth,
    aiGenerationsThisMonth,
    formsRemaining,
    submissionsRemaining,
    aiGenerationsRemaining,
    formsPercent: limits.maxForms === Infinity ? 0 : Math.round((formsUsed / limits.maxForms) * 100),
    submissionsPercent: limits.maxSubmissionsPerMonth === Infinity ? 0 : Math.round((submissionsThisMonth / limits.maxSubmissionsPerMonth) * 100),
    aiGenerationsPercent: limits.aiGenerationsPerMonth === Infinity ? 0 : Math.round((aiGenerationsThisMonth / limits.aiGenerationsPerMonth) * 100),
  };
}

/** Check if user can create a new form */
export async function canCreateForm(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("user_profiles")
    .select("plan, role")
    .eq("id", userId)
    .single();

  if (profile?.role === "super_admin") return { allowed: true };

  const plan = (profile?.plan || "free") as UserPlan;
  const limits = PLAN_LIMITS[plan];

  const { data: workspaces } = await admin
    .from("form_workspaces")
    .select("id")
    .eq("owner_id", userId);

  const wsIds = (workspaces || []).map((w) => w.id);
  if (wsIds.length === 0) return { allowed: true }; // First form triggers workspace creation

  const { count } = await admin
    .from("forms")
    .select("id", { count: "exact", head: true })
    .in("workspace_id", wsIds);

  if ((count || 0) >= limits.maxForms) {
    return {
      allowed: false,
      reason: `Limite de ${limits.maxForms} formulários atingido no plano ${plan}. Faça upgrade para criar mais.`,
    };
  }

  return { allowed: true };
}

/** Check if a form can receive more submissions this month */
export async function canReceiveSubmission(formId: string): Promise<{ allowed: boolean; reason?: string }> {
  const admin = createAdminClient();

  // Get form → workspace → owner → profile
  const { data: form } = await admin
    .from("forms")
    .select("workspace_id")
    .eq("id", formId)
    .single();

  if (!form) return { allowed: false, reason: "Formulário não encontrado" };

  const { data: workspace } = await admin
    .from("form_workspaces")
    .select("owner_id")
    .eq("id", form.workspace_id)
    .single();

  if (!workspace) return { allowed: false, reason: "Workspace não encontrado" };

  const { data: profile } = await admin
    .from("user_profiles")
    .select("plan, role")
    .eq("id", workspace.owner_id)
    .single();

  if (profile?.role === "super_admin") return { allowed: true };

  const plan = (profile?.plan || "free") as UserPlan;
  const limits = PLAN_LIMITS[plan];

  // Count submissions this month across all forms of this owner
  const { data: ownerWorkspaces } = await admin
    .from("form_workspaces")
    .select("id")
    .eq("owner_id", workspace.owner_id);

  const wsIds = (ownerWorkspaces || []).map((w) => w.id);
  const { data: ownerForms } = await admin
    .from("forms")
    .select("id")
    .in("workspace_id", wsIds);

  const fIds = (ownerForms || []).map((f) => f.id);
  if (fIds.length === 0) return { allowed: true };

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { count } = await admin
    .from("form_submissions")
    .select("id", { count: "exact", head: true })
    .in("form_id", fIds)
    .gte("created_at", monthStart)
    .eq("is_complete", true);

  if ((count || 0) >= limits.maxSubmissionsPerMonth) {
    return {
      allowed: false,
      reason: `Limite de ${limits.maxSubmissionsPerMonth.toLocaleString("pt-BR")} respostas/mês atingido no plano ${plan}.`,
    };
  }

  return { allowed: true };
}
