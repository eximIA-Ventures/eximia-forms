import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * One-time setup: creates the first admin user.
 * Only works if no users exist yet in the system.
 * DELETE this route after initial setup for security.
 */
export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "email and password are required" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "password must be at least 6 characters" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Safety: only allow if no users exist yet
  const {
    data: { users },
  } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });

  if (users && users.length > 0) {
    return NextResponse.json(
      { error: "Setup already completed. Users already exist." },
      { status: 403 }
    );
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Promote to super_admin (trigger creates profile with role='user')
  await supabase
    .from("user_profiles")
    .update({ role: "super_admin" })
    .eq("id", data.user.id);

  return NextResponse.json({
    message: "Admin user created successfully",
    user: { id: data.user.id, email: data.user.email },
  });
}
