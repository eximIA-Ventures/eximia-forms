import { NextResponse, type NextRequest } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/helpers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    await requireSuperAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();

  const { data: profiles, error } = await admin
    .from("user_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Enrich with workspace/form counts
  const enriched = await Promise.all(
    (profiles || []).map(async (profile) => {
      const { count: formsCount } = await admin
        .from("forms")
        .select("id", { count: "exact", head: true })
        .in(
          "workspace_id",
          (
            await admin
              .from("form_workspaces")
              .select("id")
              .eq("owner_id", profile.id)
          ).data?.map((w) => w.id) || []
        );

      return {
        ...profile,
        forms_count: formsCount || 0,
      };
    })
  );

  return NextResponse.json(enriched);
}

export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { email, password, full_name, role } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const { data: authData, error: authError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: full_name || "" },
    });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  // Update role if super_admin requested
  if (role === "super_admin" && authData.user) {
    await admin
      .from("user_profiles")
      .update({ role: "super_admin" })
      .eq("id", authData.user.id);
  }

  const { data: profile } = await admin
    .from("user_profiles")
    .select("*")
    .eq("id", authData.user.id)
    .single();

  return NextResponse.json(profile, { status: 201 });
}
