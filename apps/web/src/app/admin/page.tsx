"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";

import { useAdminAuth } from "@/components/admin/admin-shell";
import { PageHeader, StatusBadge, relativeTime } from "@/components/admin/ui";
import { adminApi } from "@/lib/admin-client";
import { translationFor, type Article } from "@/lib/api";

const TILES: { label: string; key: string; href: string }[] = [
  { label: "Drafts", key: "DRAFT", href: "/admin/articles?status=DRAFT" },
  { label: "Pending Review", key: "REVIEW", href: "/admin/articles/review" },
  { label: "Approved", key: "APPROVED", href: "/admin/articles?status=APPROVED" },
  { label: "Scheduled", key: "SCHEDULED", href: "/admin/articles?status=SCHEDULED" },
  { label: "Published", key: "PUBLISHED", href: "/admin/articles/published" },
  { label: "Rejected", key: "REJECTED", href: "/admin/articles?status=REJECTED" }
];

export default function AdminDashboardPage() {
  const { user, counts } = useAdminAuth();
  const [recent, setRecent] = useState<Article[]>([]);

  useEffect(() => {
    adminApi
      .list({ take: 8 })
      .then((data) => setRecent(data.items))
      .catch(() => setRecent([]));
  }, []);

  return (
    <div className="min-w-0">
      <PageHeader
        eyebrow="Workspace"
        title={`Welcome, ${user?.name || "there"}`}
        actions={
          <Link href="/admin/articles/new" className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-bold text-white">
            New Article
          </Link>
        }
      />

      <p className="mt-4 text-sm text-black/60">
        Signed in as <span className="font-bold">{user?.roles.join(", ")}</span> · permissions:{" "}
        {user?.permissions.join(", ") || "none"}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map((tile) => (
          <Link
            key={tile.key}
            href={tile.href as Route}
            className="rounded-lg border bg-white p-5 shadow-editorial transition hover:border-brand-600"
          >
            <div className="eyebrow">{tile.label}</div>
            <div className="mt-2 text-4xl font-black">{counts[tile.key] ?? 0}</div>
          </Link>
        ))}
      </div>

      <section className="mt-8 rounded-lg border bg-white shadow-editorial">
        <div className="border-b px-4 py-3 text-xs font-bold uppercase text-black/50">Recent activity</div>
        <ul className="divide-y">
          {recent.map((article) => (
            <li key={article.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <Link
                href={`/admin/articles/${article.id}` as Route}
                className="min-w-0 flex-1 truncate text-sm font-semibold hover:text-brand-600"
              >
                {translationFor(article, "en")?.title || article.slug}
              </Link>
              <StatusBadge status={article.status} />
              <span className="text-[11px] text-black/40">{relativeTime(article.updatedAt)}</span>
            </li>
          ))}
          {!recent.length && <li className="px-4 py-8 text-center text-sm text-black/50">Nothing here yet.</li>}
        </ul>
      </section>
    </div>
  );
}
