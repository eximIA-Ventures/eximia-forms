import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ role: null }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("user_profiles")
    .select("role, plan")
    .eq("id", user.id)
    .single();

  return NextResponse.json({
    role: data?.role || "user",
    plan: data?.plan || "free",
  });
}
