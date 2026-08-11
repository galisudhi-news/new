"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  ClipboardCheck,
  FileText,
  Files,
  Globe,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  PenSquare,
  Send,
  Users,
  XCircle,
  CalendarClock
} from "lucide-react";

import { adminApi, clearToken, getToken } from "@/lib/admin-client";
import type { AdminUser } from "@/lib/api";

type AdminAuth = {
  user: AdminUser | null;
  loading: boolean;
  counts: Record<string, number>;
  refresh: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuth>({
  user: null,
  loading: true,
  counts: {},
  refresh: async () => {}
});

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

const NAV: { href: string; label: string; icon: typeof FileText; countKey?: string }[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/articles", label: "All Articles", icon: Files, countKey: "ALL" },
  { href: "/admin/articles?status=DRAFT", label: "Drafts", icon: FileText, countKey: "DRAFT" },
  { href: "/admin/articles/review", label: "Pending Review", icon: ClipboardCheck, countKey: "REVIEW" },
  { href: "/admin/articles?status=APPROVED", label: "Approved", icon: Send, countKey: "APPROVED" },
  { href: "/admin/articles?status=SCHEDULED", label: "Scheduled", icon: CalendarClock, countKey: "SCHEDULED" },
  { href: "/admin/articles/published", label: "Published", icon: Globe, countKey: "PUBLISHED" },
  { href: "/admin/articles?status=REJECTED", label: "Rejected", icon: XCircle, countKey: "REJECTED" },
  { href: "/admin/media", label: "Media Library", icon: ImageIcon },
  { href: "/admin/users", label: "Users & Roles", icon: Users }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  /** A token is present in storage but the profile may still be loading. */
  const [hasToken, setHasToken] = useState(false);
  const isLoginPage = pathname === "/admin/login";

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setHasToken(false);
      setLoading(false);
      return;
    }
    setHasToken(true);
    try {
      const [profile, articleCounts] = await Promise.all([adminApi.me(), adminApi.counts().catch(() => ({}))]);
      setUser(profile);
      setCounts(articleCounts as Record<string, number>);
    } catch {
      clearToken();
      setUser(null);
      setHasToken(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh, pathname]);

  useEffect(() => {
    // Redirect on a missing/rejected token only. Right after login the profile
    // request is still in flight, so `user` is legitimately null for a moment —
    // keying off `user` alone bounced the first sign-in straight back here.
    if (loading || isLoginPage) return;
    if (!user && !hasToken && !getToken()) router.replace("/admin/login");
  }, [loading, user, hasToken, isLoginPage, router]);

  function logout() {
    clearToken();
    setUser(null);
    setHasToken(false);
    router.replace("/admin/login");
  }

  if (isLoginPage) {
    return (
      <AdminAuthContext.Provider value={{ user, loading, counts, refresh }}>{children}</AdminAuthContext.Provider>
    );
  }

  // Covers all three waits: first auth check, the post-login profile fetch, and
  // the moment before the redirect to /admin/login lands.
  if (loading || !user) {
    return <div className="p-10 text-sm font-semibold text-black/50">Loading workspace…</div>;
  }

  return (
    <AdminAuthContext.Provider value={{ user, loading, counts, refresh }}>
      <div className="flex min-h-screen w-full flex-col bg-neutral-50 lg:flex-row">
        <aside className="w-full shrink-0 border-b border-black/10 bg-white lg:w-64 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-2 border-b px-5 py-4">
            <span className="text-xl font-black">
              <span className="text-brand-600">ಗಾಳಿ</span> ಸುದ್ದಿ
            </span>
          </div>

          <div className="px-5 py-4">
            <Link
              href="/admin/articles/new"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-xs font-bold text-white"
            >
              <PenSquare size={15} /> New Article
            </Link>
          </div>

          <nav className="flex flex-wrap gap-1 px-3 pb-4 lg:flex-col lg:flex-nowrap">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, searchParams.get("status"), item.href);
              const count = item.countKey ? counts[item.countKey] : undefined;
              return (
                <Link
                  key={item.href}
                  href={item.href as Route}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                    active ? "bg-brand-50 text-brand-700" : "text-black/70 hover:bg-black/5"
                  }`}
                >
                  <Icon size={16} className="shrink-0" />
                  <span className="min-w-0 truncate">{item.label}</span>
                  {count !== undefined && count > 0 && (
                    <span className="ml-auto rounded-full bg-black/10 px-2 py-0.5 text-[11px] font-bold">{count}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex flex-wrap items-center gap-3 border-b border-black/10 bg-white px-4 py-3 sm:px-8">
            <Link href="/en" className="text-xs font-bold text-black/50 hover:text-brand-600">
              ← View site
            </Link>
            <div className="ml-auto flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-bold leading-tight">{user.name}</div>
                <div className="text-[11px] font-semibold uppercase text-black/50">{user.roles.join(", ") || "No role"}</div>
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold hover:bg-black/5"
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          </header>

          <main className="min-w-0 p-4 sm:p-8">{children}</main>
        </div>
      </div>
    </AdminAuthContext.Provider>
  );
}

function isActive(pathname: string, status: string | null, href: string) {
  const [path, query] = href.split("?");
  if (path === "/admin") return pathname === "/admin";

  const wantedStatus = query ? new URLSearchParams(query).get("status") : null;
  if (path === "/admin/articles") {
    // "All Articles" and the status filters share a route; the query decides.
    return pathname === path && (status || null) === wantedStatus;
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}
