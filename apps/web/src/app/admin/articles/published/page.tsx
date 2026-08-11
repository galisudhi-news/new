"use client";

import { ArticleList } from "@/components/admin/article-list";

export default function PublishedArticlesPage() {
  return (
    <ArticleList
      status="PUBLISHED"
      variant="published"
      eyebrow="Live"
      title="Published"
      emptyMessage="Nothing has been published yet."
    />
  );
}
