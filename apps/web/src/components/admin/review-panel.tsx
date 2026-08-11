"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { PencilLine } from "lucide-react";

import { adminApi } from "@/lib/admin-client";
import { translationFor, type Article } from "@/lib/api";
import { Notice, PageHeader, StatusBadge, formatDateTime } from "./ui";
import { WorkflowActions } from "./workflow-actions";
import { useAdminAuth } from "./admin-shell";

export function ReviewPanel({ articleId }: { articleId: string }) {
  const { refresh } = useAdminAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setArticle(await adminApi.get(articleId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the article");
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <div className="text-sm font-semibold text-black/50">Loading article…</div>;
  if (error) return <Notice tone="error">{error}</Notice>;
  if (!article) return <Notice tone="error">Article not found.</Notice>;

  const en = translationFor(article, "en");
  const kn = translationFor(article, "kn");

  return (
    <div className="min-w-0">
      <PageHeader
        eyebrow="Editorial Review"
        title={en?.title || article.slug}
        actions={
          <>
            <StatusBadge status={article.status} />
            <Link
              href={`/admin/articles/${article.id}` as Route}
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-bold hover:bg-black/5"
            >
              <PencilLine size={14} /> Edit
            </Link>
          </>
        }
      />

      {article.reviewNote && (
        <div className="mt-5">
          <Notice>Latest note: {article.reviewNote}</Notice>
        </div>
      )}

      <div className="mt-6 rounded-lg border bg-white p-4 shadow-editorial sm:p-6">
        <WorkflowActions
          article={article}
          compact
          onDone={async () => {
            // Re-read so the status, review note and history reflect the decision.
            await load();
            await refresh();
          }}
        />
      </div>

      <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          {article.featuredImage && (
            <section className="overflow-hidden rounded-lg border bg-white shadow-editorial">
              {/* Editors paste arbitrary CDN URLs, so this stays a plain img. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={article.featuredImage} alt="" className="h-auto w-full object-cover" />
              <div className="px-4 py-2 text-[11px] text-black/50">Featured image</div>
            </section>
          )}

          <LanguagePanel heading="English" translation={en} />
          <LanguagePanel heading="ಕನ್ನಡ (Kannada)" translation={kn} kannada />
        </div>

        <aside className="min-w-0 space-y-6">
          <section className="rounded-lg border bg-white p-4 shadow-editorial sm:p-6">
            <h2 className="mb-4 text-sm font-bold uppercase text-black/50">Details</h2>
            <dl className="space-y-3 text-sm">
              <Detail label="Author" value={article.author?.name} />
              <Detail label="Reporter" value={article.reporter?.name} />
              <Detail label="Category" value={article.category?.name} />
              <Detail label="District" value={article.district?.nameEn} />
              <Detail label="Slug" value={`/${article.slug}`} />
              <Detail label="Submitted" value={formatDateTime(article.submittedAt)} />
              <Detail label="Submitted by" value={article.submittedBy?.name} />
              <Detail label="Last reviewed" value={formatDateTime(article.reviewedAt)} />
              <Detail label="Scheduled for" value={formatDateTime(article.scheduledAt)} />
              <Detail label="Flags" value={[article.isBreaking && "Breaking", article.isFeatured && "Featured"].filter(Boolean).join(", ")} />
              <div>
                <dt className="text-[11px] font-bold uppercase text-black/40">Tags</dt>
                <dd className="mt-1 flex flex-wrap gap-2">
                  {(article.tags || []).map((tag) => (
                    <span key={tag.id} className="rounded-full border px-2 py-0.5 text-xs font-semibold">
                      {tag.name}
                    </span>
                  ))}
                  {!article.tags?.length && <span className="text-black/50">—</span>}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border bg-white p-4 shadow-editorial sm:p-6">
            <h2 className="mb-4 text-sm font-bold uppercase text-black/50">SEO</h2>
            <dl className="space-y-3 text-sm">
              <Detail label="EN meta title" value={en?.seoTitle} />
              <Detail label="EN meta description" value={en?.seoDescription} />
              <Detail label="KN meta title" value={kn?.seoTitle} kannada />
              <Detail label="KN meta description" value={kn?.seoDescription} kannada />
              <Detail label="EN URL" value={en?.slug ? `/en/news/${en.slug}` : `/en/news/${article.slug}`} />
              <Detail label="KN URL" value={kn?.slug ? `/kn/news/${kn.slug}` : `/kn/news/${article.slug}`} />
              <Detail label="Canonical" value={article.seo?.canonicalUrl} />
              <Detail label="OG image" value={article.seo?.ogImage} />
            </dl>
          </section>

          <section className="rounded-lg border bg-white p-4 shadow-editorial sm:p-6">
            <h2 className="mb-4 text-sm font-bold uppercase text-black/50">History</h2>
            <ul className="space-y-3 text-sm">
              {(article.auditLogs || []).map((entry) => (
                <li key={entry.id} className="border-b pb-3 last:border-0">
                  <div className="font-bold">{entry.action.replaceAll("_", " ")}</div>
                  <div className="text-xs text-black/50">
                    {entry.actor?.name || "system"} · {formatDateTime(entry.createdAt)}
                  </div>
                  {entry.note && <p className="mt-1 text-xs text-black/60">“{entry.note}”</p>}
                </li>
              ))}
              {!article.auditLogs?.length && <li className="text-black/50">No activity yet.</li>}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

function LanguagePanel({
  heading,
  translation,
  kannada = false
}: {
  heading: string;
  translation?: { title: string; subtitle: string | null; body: string };
  kannada?: boolean;
}) {
  return (
    <section className={`min-w-0 rounded-lg border bg-white p-4 shadow-editorial sm:p-6 ${kannada ? "font-kannada" : ""}`}>
      <div className="eyebrow">{heading}</div>
      {translation ? (
        <>
          <h2 className="headline mt-2 break-words text-2xl sm:text-3xl">{translation.title}</h2>
          {translation.subtitle && <p className="mt-2 text-black/60">{translation.subtitle}</p>}
          <div className="mt-4 whitespace-pre-wrap break-words text-[15px] leading-relaxed">{translation.body}</div>
        </>
      ) : (
        <p className="mt-2 text-sm text-red-700">This translation is missing.</p>
      )}
    </section>
  );
}

function Detail({ label, value, kannada = false }: { label: string; value?: string | null; kannada?: boolean }) {
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase text-black/40">{label}</dt>
      <dd className={`break-words ${kannada ? "font-kannada" : ""}`}>{value || "—"}</dd>
    </div>
  );
}
