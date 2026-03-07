import { NextResponse, type NextRequest } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/helpers";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ workspaceId: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await requireSuperAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { workspaceId } = await params;
  const body = await request.json();
  const admin = createAdminClient();

  const updates: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim()) {
    updates.name = body.name.trim();
    updates.slug = body.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data, error } = await admin
    .from("form_workspaces")
    .update(updates)
    .eq("id", workspaceId)
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

  const { workspaceId } = await params;
  const admin = createAdminClient();

  // Delete in order: submissions → forms → workspace
  const { data: forms } = await admin
    .from("forms")
    .select("id")
    .eq("workspace_id", workspaceId);

  const formIds = (forms || []).map((f) => f.id);

  if (formIds.length > 0) {
    await admin.from("form_submissions").delete().in("form_id", formIds);
    await admin.from("form_analytics").delete().in("form_id", formIds);
    await admin.from("form_ai_analyses").delete().in("form_id", formIds);
    await admin.from("forms").delete().eq("workspace_id", workspaceId);
  }

  const { error } = await admin
    .from("form_workspaces")
    .delete()
    .eq("id", workspaceId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
