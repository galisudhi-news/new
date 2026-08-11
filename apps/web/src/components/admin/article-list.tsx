"use client";

import Link from "next/link";
import type { Route } from "next";
import { useCallback, useEffect, useState } from "react";
import { Eye, PencilLine, Search } from "lucide-react";

import { adminApi } from "@/lib/admin-client";
import { translationFor, type Article, type ArticleStatus } from "@/lib/api";
import { Notice, PageHeader, StatusBadge, formatDateTime, relativeTime } from "./ui";

export function ArticleList({
  status,
  eyebrow,
  title,
  variant = "default",
  emptyMessage
}: {
  status?: ArticleStatus;
  eyebrow: string;
  title: string;
  /** "review" swaps the edit link for a Review button and shows submitted time. */
  variant?: "default" | "review" | "published";
  emptyMessage?: string;
}) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminApi.list({ status, search: query || undefined, take: 100 });
      setArticles(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load articles");
    } finally {
      setLoading(false);
    }
  }, [status, query]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="min-w-0">
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        actions={
          <Link
            href="/admin/articles/new"
            className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-bold text-white"
          >
            New Article
          </Link>
        }
      />

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setQuery(search.trim());
        }}
        className="mt-5 flex max-w-md items-center gap-2"
      >
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by title or slug"
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
        <button className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold hover:bg-black/5">
          <Search size={15} /> Search
        </button>
      </form>

      {error && (
        <div className="mt-5">
          <Notice tone="error">{error}</Notice>
        </div>
      )}

      <div className="mt-5 rounded-lg border bg-white shadow-editorial">
        <div className="border-b px-4 py-3 text-xs font-bold uppercase text-black/50">
          {loading ? "Loading…" : `${total} article${total === 1 ? "" : "s"}`}
        </div>

        <div className="responsive-table">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-[11px] uppercase text-black/50">
              <tr>
                <th className="px-4 py-3 font-bold">Title</th>
                <th className="px-4 py-3 font-bold">Reporter</th>
                <th className="px-4 py-3 font-bold">Category</th>
                <th className="px-4 py-3 font-bold">
                  {variant === "review" ? "Submitted" : variant === "published" ? "Published" : "Updated"}
                </th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => {
                const en = translationFor(article, "en");
                const kn = translationFor(article, "kn");
                const reporter = article.reporter?.name || article.author?.name || "—";
                const timeValue =
                  variant === "review"
                    ? article.submittedAt
                    : variant === "published"
                      ? article.publishedAt
                      : article.updatedAt;
                return (
                  <tr key={article.id} className="border-t align-top">
                    <td className="max-w-xs px-4 py-3">
                      <Link
                        href={`/admin/articles/${article.id}` as Route}
                        className="font-semibold hover:text-brand-600"
                      >
                        {en?.title || kn?.title || article.slug}
                      </Link>
                      {kn?.title && <div className="font-kannada mt-1 text-xs text-black/50">{kn.title}</div>}
                      <div className="mt-1 text-[11px] text-black/40">/{article.slug}</div>
                    </td>
                    <td className="px-4 py-3">{reporter}</td>
                    <td className="px-4 py-3">{article.category?.name || "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3" title={formatDateTime(timeValue)}>
                      {relativeTime(timeValue)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={article.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        {article.status === "PUBLISHED" && (
                          <Link
                            href={`/en/news/${en?.slug || article.slug}` as Route}
                            target="_blank"
                            className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-bold hover:bg-black/5"
                          >
                            <Eye size={14} /> View
                          </Link>
                        )}
                        {article.status === "REVIEW" || variant === "review" ? (
                          <Link
                            href={`/admin/articles/review/${article.id}` as Route}
                            className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white"
                          >
                            Review
                          </Link>
                        ) : (
                          <Link
                            href={`/admin/articles/${article.id}` as Route}
                            className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-bold hover:bg-black/5"
                          >
                            <PencilLine size={14} /> Edit
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && !articles.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-black/50">
                    {emptyMessage || "No articles here yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
