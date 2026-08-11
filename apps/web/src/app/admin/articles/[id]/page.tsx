"use client";

import { useParams } from "next/navigation";

import { ArticleForm } from "@/components/admin/article-form";

export default function EditArticlePage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  if (!id) return null;
  return <ArticleForm articleId={id} />;
}
