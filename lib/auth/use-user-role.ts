"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/types";

export function useUserRole() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("[useUserRole] Error fetching profile:", error.message);
      }

      const fetchedRole = (data?.role as UserRole) || "user";
      setRole(fetchedRole);
      setLoading(false);
    }

    fetchRole();
  }, []);

  return { role, isSuperAdmin: role === "super_admin", loading };
}
