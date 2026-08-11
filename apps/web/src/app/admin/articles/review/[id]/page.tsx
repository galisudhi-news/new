"use client";

import { useParams } from "next/navigation";

import { ReviewPanel } from "@/components/admin/review-panel";

export default function ReviewArticlePage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  if (!id) return null;
  return <ReviewPanel articleId={id} />;
}
