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
} from "lucide-react";
import Image from "next/image";
import { ToastProvider } from "@/components/ui/toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/forms", label: "Formulários", icon: FileText },
  { href: "/admin/settings", label: "Configurações", icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLight, setIsLight] = useState(false);

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
    router.push("/admin/login");
  }

  // Skip layout for login and builder pages (they have their own layout)
  if (pathname.includes("/edit") || pathname.includes("/login")) {
    return <ToastProvider>{children}</ToastProvider>;
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen">
        {/* Sidebar — Desktop */}
        <aside className="hidden w-56 flex-col border-r border-border bg-surface md:flex">
          <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
            <Image
              src={isLight ? "/logo-horizontal-dark.svg" : "/logo-horizontal.svg"}
              alt="eximIA"
              width={110}
              height={24}
            />
            <span className="text-sm font-medium tracking-wide text-muted">
              forms
            </span>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {NAV_ITEMS.map((item) => {
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
          <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4 md:hidden">
            <div className="flex items-center gap-2.5">
              <Image
                src={isLight ? "/logo-horizontal-dark.svg" : "/logo-horizontal.svg"}
                alt="eximIA"
                width={100}
                height={22}
              />
              <span className="rounded-md bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                Forms
              </span>
            </div>
            <button onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </header>

          {/* Mobile nav overlay */}
          {mobileOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <nav
                className="absolute left-0 top-14 bottom-0 w-64 bg-surface border-r border-border p-3 shadow-xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex-1 space-y-1">
                  {NAV_ITEMS.map((item) => {
                    const isActive = item.exact
                      ? pathname === item.href
                      : pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors",
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
                </div>
                <div className="border-t border-border pt-3 space-y-1">
                  <ThemeToggle />
                  <button
                    onClick={() => { setMobileOpen(false); handleSignOut(); }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-elevated hover:text-primary"
                  >
                    <LogOut size={16} />
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
