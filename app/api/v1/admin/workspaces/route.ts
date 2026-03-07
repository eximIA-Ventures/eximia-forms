import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/helpers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    await requireSuperAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("form_workspaces")
    .select("*, user_profiles:owner_id(email, full_name, role)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Enrich with form counts
  const enriched = await Promise.all(
    (data || []).map(async (workspace) => {
      const { count } = await admin
        .from("forms")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", workspace.id);

      return { ...workspace, forms_count: count || 0 };
    })
  );

  return NextResponse.json(enriched);
}
