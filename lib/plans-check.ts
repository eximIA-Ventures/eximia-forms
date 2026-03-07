import { createAdminClient } from "@/lib/supabase/admin";
import { PLAN_LIMITS } from "@/lib/plans";
import type { UserPlan } from "@/lib/types";

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** Check if a user can use AI generation and return remaining count */
export async function checkAiAccess(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  used: number;
  limit: number;
  remaining: number;
}> {
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("user_profiles")
    .select("plan, role")
    .eq("id", userId)
    .single();

  if (profile?.role === "super_admin") {
    return { allowed: true, used: 0, limit: Infinity, remaining: Infinity };
  }

  const plan = (profile?.plan || "free") as UserPlan;
  const limits = PLAN_LIMITS[plan];
  const month = getCurrentMonth();

  const { data: usage } = await admin
    .from("ai_usage")
    .select("generation_count")
    .eq("user_id", userId)
    .eq("month", month)
    .single();

  const used = usage?.generation_count || 0;
  const remaining = Math.max(0, limits.aiGenerationsPerMonth - used);

  if (used >= limits.aiGenerationsPerMonth) {
    return {
      allowed: false,
      reason: `Você usou suas ${limits.aiGenerationsPerMonth} gerações de IA este mês (plano ${plan}). Faça upgrade para mais.`,
      used,
      limit: limits.aiGenerationsPerMonth,
      remaining: 0,
    };
  }

  return {
    allowed: true,
    used,
    limit: limits.aiGenerationsPerMonth,
    remaining,
  };
}

/** Increment AI usage counter after a successful generation */
export async function incrementAiUsage(userId: string): Promise<void> {
  const admin = createAdminClient();
  const month = getCurrentMonth();

  // Upsert: insert or increment
  const { data: existing } = await admin
    .from("ai_usage")
    .select("generation_count")
    .eq("user_id", userId)
    .eq("month", month)
    .single();

  if (existing) {
    await admin
      .from("ai_usage")
      .update({ generation_count: existing.generation_count + 1 })
      .eq("user_id", userId)
      .eq("month", month);
  } else {
    await admin
      .from("ai_usage")
      .insert({ user_id: userId, month, generation_count: 1 });
  }
}
