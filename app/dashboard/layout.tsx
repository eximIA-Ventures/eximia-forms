"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  FileText,
  Settings,
  Menu,
  X,
  LogOut,
  Users,
  Globe,
  Layers,
  Shield,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { ToastProvider } from "@/components/ui/toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/lib/auth/use-user-role";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  exact?: boolean;
  superAdminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/forms", label: "Formulários", icon: FileText },
  { href: "/dashboard/users", label: "Usuários", icon: Users, superAdminOnly: true },
  { href: "/dashboard/workspaces", label: "Workspaces", icon: Layers, superAdminOnly: true },
  { href: "/dashboard/global", label: "Visão Global", icon: Globe, superAdminOnly: true },
  { href: "/dashboard/upgrade", label: "Planos", icon: Zap },
  { href: "/dashboard/settings", label: "Configurações", icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const { isSuperAdmin } = useUserRole();

  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.superAdminOnly || isSuperAdmin
  );

  useEffect(() => {
    const check = () =>
      setIsLight(document.documentElement.classList.contains("light"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/dashboard/login");
  }

  // Skip layout for login, register, and builder pages (they have their own layout)
  if (pathname.includes("/edit") || pathname.includes("/login") || pathname.includes("/register") || pathname.includes("/onboarding")) {
    return <ToastProvider>{children}</ToastProvider>;
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen">
        {/* Sidebar — Desktop */}
        <aside className="hidden w-56 flex-col border-r border-border bg-surface md:flex">
          <div className="flex h-14 items-center gap-3 border-b border-border px-4">
            <Image
              src={isLight ? "/logo-horizontal-dark.svg" : "/logo-horizontal.svg"}
              alt="eximIA"
              width={110}
              height={24}
            />
            <div className="h-5 w-px bg-muted/30" />
            <div className="flex flex-col items-start">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                Forms
              </span>
              <div className="mt-0.5 h-[2px] w-full rounded-full bg-accent" />
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {visibleNavItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-accent/10 text-accent font-medium"
                      : "text-muted hover:bg-elevated hover:text-primary"
                  )}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {isSuperAdmin && (
            <div className="mx-3 mb-2 flex items-center gap-2 rounded-lg bg-accent/10 px-3 py-2 text-xs font-medium text-accent">
              <Shield size={14} />
              Super Admin
            </div>
          )}

          <div className="border-t border-border p-3 space-y-1">
            <ThemeToggle />
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted hover:bg-elevated hover:text-primary"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </aside>

        {/* Mobile header */}
        <div className="flex flex-1 flex-col">
          <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-5 md:hidden">
            <div className="flex items-center gap-2.5">
              <Image
                src={isLight ? "/logo-horizontal-dark.svg" : "/logo-horizontal.svg"}
                alt="eximIA"
                width={100}
                height={22}
              />
              <div className="h-4 w-px bg-muted/30" />
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  Forms
                </span>
                <div className="mt-0.5 h-[1.5px] w-full rounded-full bg-accent" />
              </div>
            </div>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </header>

          {/* Mobile nav overlay */}
          {mobileOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <nav
                className="absolute left-0 top-14 bottom-0 w-72 max-w-[calc(100vw-3rem)] bg-surface border-r border-border p-4 shadow-xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex-1 space-y-1">
                  {visibleNavItems.map((item) => {
                    const isActive = item.exact
                      ? pathname === item.href
                      : pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors",
                          isActive
                            ? "bg-accent/10 text-accent font-medium"
                            : "text-muted hover:bg-elevated hover:text-primary"
                        )}
                      >
                        <item.icon size={18} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
                <div className="border-t border-border pt-3 space-y-1">
                  <ThemeToggle />
                  <button
                    onClick={() => { setMobileOpen(false); handleSignOut(); }}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-muted hover:bg-elevated hover:text-primary"
                  >
                    <LogOut size={18} />
                    Sair
                  </button>
                </div>
              </nav>
            </div>
          )}

          {/* Main content */}
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
