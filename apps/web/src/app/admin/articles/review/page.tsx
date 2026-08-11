"use client";

import { ArticleList } from "@/components/admin/article-list";

export default function PendingReviewPage() {
  return (
    <ArticleList
      status="REVIEW"
      variant="review"
      eyebrow="Editorial Desk"
      title="Pending Review"
      emptyMessage="Nothing is waiting for review."
    />
  );
}
