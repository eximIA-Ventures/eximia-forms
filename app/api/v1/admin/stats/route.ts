import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLAN_PRICING } from "@/lib/plans";
import type { UserPlan } from "@/lib/types";

export async function GET() {
  try {
    await requireSuperAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();

  const [users, forms, submissions, workspaces] = await Promise.all([
    admin.from("user_profiles").select("id", { count: "exact", head: true }),
    admin.from("forms").select("id", { count: "exact", head: true }),
    admin
      .from("form_submissions")
      .select("id", { count: "exact", head: true })
      .eq("is_complete", true),
    admin.from("form_workspaces").select("id", { count: "exact", head: true }),
  ]);

  // Users by plan
  const { data: allProfiles } = await admin
    .from("user_profiles")
    .select("plan, is_active, created_at");

  const usersByPlan: Record<string, number> = { free: 0, pro: 0, business: 0, enterprise: 0 };
  let activeUsers = 0;

  // New users this month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  let newUsersThisMonth = 0;
  let newUsersLastMonth = 0;

  for (const p of allProfiles || []) {
    const plan = (p.plan || "free") as string;
    usersByPlan[plan] = (usersByPlan[plan] || 0) + 1;
    if (p.is_active) activeUsers++;
    if (p.created_at >= monthStart) newUsersThisMonth++;
    else if (p.created_at >= lastMonthStart) newUsersLastMonth++;
  }

  // MRR projection (based on current plan distribution)
  let mrrBrl = 0;
  let mrrUsd = 0;
  for (const [plan, count] of Object.entries(usersByPlan)) {
    const pricing = PLAN_PRICING[plan as UserPlan];
    if (pricing) {
      mrrBrl += pricing.brl * count;
      mrrUsd += pricing.usd * count;
    }
  }

  // Submissions this month vs last month
  const { count: subsThisMonth } = await admin
    .from("form_submissions")
    .select("id", { count: "exact", head: true })
    .gte("created_at", monthStart)
    .eq("is_complete", true);

  const { count: subsLastMonth } = await admin
    .from("form_submissions")
    .select("id", { count: "exact", head: true })
    .gte("created_at", lastMonthStart)
    .lt("created_at", monthStart)
    .eq("is_complete", true);

  // Recent forms across all workspaces
  const { data: recentForms } = await admin
    .from("forms")
    .select(
      "id, title, status, created_at, updated_at, workspace_id, form_workspaces(name, owner_id, user_profiles:owner_id(email, full_name))"
    )
    .order("updated_at", { ascending: false })
    .limit(10);

  return NextResponse.json({
    total_users: users.count || 0,
    total_forms: forms.count || 0,
    total_submissions: submissions.count || 0,
    total_workspaces: workspaces.count || 0,
    active_users: activeUsers,
    users_by_plan: usersByPlan,
    new_users_this_month: newUsersThisMonth,
    new_users_last_month: newUsersLastMonth,
    user_growth_percent: newUsersLastMonth > 0
      ? Math.round(((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100)
      : newUsersThisMonth > 0 ? 100 : 0,
    mrr_brl: mrrBrl,
    mrr_usd: mrrUsd,
    submissions_this_month: subsThisMonth || 0,
    submissions_last_month: subsLastMonth || 0,
    submissions_growth_percent: (subsLastMonth || 0) > 0
      ? Math.round((((subsThisMonth || 0) - (subsLastMonth || 0)) / (subsLastMonth || 1)) * 100)
      : (subsThisMonth || 0) > 0 ? 100 : 0,
    recent_forms: recentForms || [],
  });
}
