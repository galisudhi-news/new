"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { ArticleList } from "@/components/admin/article-list";
import { ARTICLE_STATUSES, STATUS_LABEL, type ArticleStatus } from "@/lib/api";

function ArticlesView() {
  const searchParams = useSearchParams();
  const raw = (searchParams.get("status") || "").toUpperCase();
  const status = (ARTICLE_STATUSES as readonly string[]).includes(raw) ? (raw as ArticleStatus) : undefined;

  return (
    <ArticleList
      status={status}
      eyebrow="Newsroom"
      title={status ? STATUS_LABEL[status] : "All Articles"}
      variant={status === "REVIEW" ? "review" : status === "PUBLISHED" ? "published" : "default"}
      emptyMessage={status ? `No ${STATUS_LABEL[status].toLowerCase()} articles.` : "No articles yet."}
    />
  );
}

export default function AdminArticlesPage() {
  return (
    <Suspense fallback={<div className="text-sm font-semibold text-black/50">Loading…</div>}>
      <ArticlesView />
    </Suspense>
  );
}
