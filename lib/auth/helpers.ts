import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserProfile } from "@/lib/types";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { user, profile: profile as UserProfile | null };
}

export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return data as UserProfile | null;
}

export async function isUserSuperAdmin(): Promise<boolean> {
  const result = await getCurrentUser();
  return result?.profile?.role === "super_admin" && result.profile.is_active === true;
}

export async function requireSuperAdmin() {
  const result = await getCurrentUser();

  if (!result?.user) {
    throw new Error("Unauthorized");
  }

  if (result.profile?.role !== "super_admin" || !result.profile.is_active) {
    throw new Error("Forbidden: super_admin required");
  }

  return result;
}
