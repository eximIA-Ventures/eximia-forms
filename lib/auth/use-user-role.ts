"use client";

import { useEffect, useState } from "react";
import type { UserRole } from "@/lib/types";

export function useUserRole() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const { role: fetchedRole } = await res.json();
          setRole(fetchedRole || "user");
        } else {
          setRole("user");
        }
      } catch {
        setRole("user");
      }
      setLoading(false);
    }

    fetchRole();
  }, []);

  return { role, isSuperAdmin: role === "super_admin", loading };
}
