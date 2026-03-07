import { NextResponse, type NextRequest } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/helpers";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ userId: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await requireSuperAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;
  const admin = createAdminClient();

  const { data: profile, error } = await admin
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Get workspaces
  const { data: workspaces } = await admin
    .from("form_workspaces")
    .select("*")
    .eq("owner_id", userId);

  // Get forms via workspaces
  const workspaceIds = (workspaces || []).map((w) => w.id);
  const { data: forms } = workspaceIds.length > 0
    ? await admin
        .from("forms")
        .select("id, title, status, created_at, updated_at")
        .in("workspace_id", workspaceIds)
        .order("updated_at", { ascending: false })
    : { data: [] };

  // Get submission counts
  const formIds = (forms || []).map((f) => f.id);
  const { count: submissionCount } = formIds.length > 0
    ? await admin
        .from("form_submissions")
        .select("id", { count: "exact", head: true })
        .in("form_id", formIds)
    : { count: 0 };

  return NextResponse.json({
    ...profile,
    workspaces: workspaces || [],
    forms: forms || [],
    submission_count: submissionCount || 0,
  });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await requireSuperAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;
  const body = await request.json();
  const admin = createAdminClient();

  const validPlans = ["free", "pro", "business", "enterprise"];
  const updates: Record<string, unknown> = {};
  if (typeof body.is_active === "boolean") updates.is_active = body.is_active;
  if (body.role === "user" || body.role === "super_admin") updates.role = body.role;
  if (typeof body.full_name === "string") updates.full_name = body.full_name;
  if (typeof body.plan === "string" && validPlans.includes(body.plan)) updates.plan = body.plan;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data, error } = await admin
    .from("user_profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await requireSuperAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;
  const admin = createAdminClient();

  const { error } = await admin.auth.admin.deleteUser(userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
