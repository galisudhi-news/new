"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { CheckCircle2, Save, Send } from "lucide-react";

import { adminApi, can } from "@/lib/admin-client";
import { translationFor, type Article } from "@/lib/api";
import { useAdminAuth } from "./admin-shell";
import { Notice, PageHeader, StatusBadge, formatDateTime } from "./ui";
import { WorkflowActions } from "./workflow-actions";

type FormState = {
  slug: string;
  categorySlug: string;
  categoryName: string;
  districtSlug: string;
  featuredImage: string;
  tags: string;
  canonicalUrl: string;
  ogImage: string;
  isBreaking: boolean;
  isFeatured: boolean;
  enTitle: string;
  enSubtitle: string;
  enBody: string;
  enSlug: string;
  enSeoTitle: string;
  enSeoDescription: string;
  knTitle: string;
  knSubtitle: string;
  knBody: string;
  knSlug: string;
  knSeoTitle: string;
  knSeoDescription: string;
};

const EMPTY: FormState = {
  slug: "",
  categorySlug: "karnataka",
  categoryName: "Karnataka",
  districtSlug: "",
  featuredImage: "",
  tags: "",
  canonicalUrl: "",
  ogImage: "",
  isBreaking: false,
  isFeatured: false,
  enTitle: "",
  enSubtitle: "",
  enBody: "",
  enSlug: "",
  enSeoTitle: "",
  enSeoDescription: "",
  knTitle: "",
  knSubtitle: "",
  knBody: "",
  knSlug: "",
  knSeoTitle: "",
  knSeoDescription: ""
};

function toFormState(article: Article): FormState {
  const en = translationFor(article, "en");
  const kn = translationFor(article, "kn");
  return {
    slug: article.slug,
    categorySlug: article.category?.slug || "",
    categoryName: article.category?.name || "",
    districtSlug: article.district?.slug || "",
    featuredImage: article.featuredImage || "",
    tags: (article.tags || []).map((tag) => tag.name).join(", "),
    canonicalUrl: article.seo?.canonicalUrl || "",
    ogImage: article.seo?.ogImage || "",
    isBreaking: article.isBreaking,
    isFeatured: article.isFeatured,
    enTitle: en?.title || "",
    enSubtitle: en?.subtitle || "",
    enBody: en?.body || "",
    enSlug: en?.slug || "",
    enSeoTitle: en?.seoTitle || "",
    enSeoDescription: en?.seoDescription || "",
    knTitle: kn?.title || "",
    knSubtitle: kn?.subtitle || "",
    knBody: kn?.body || "",
    knSlug: kn?.slug || "",
    knSeoTitle: kn?.seoTitle || "",
    knSeoDescription: kn?.seoDescription || ""
  };
}

function toPayload(form: FormState) {
  return {
    slug: form.slug,
    categorySlug: form.categorySlug,
    categoryName: form.categoryName || form.categorySlug,
    districtSlug: form.districtSlug || undefined,
    featuredImage: form.featuredImage || undefined,
    isBreaking: form.isBreaking,
    isFeatured: form.isFeatured,
    tags: form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    seo: { canonicalUrl: form.canonicalUrl || undefined, ogImage: form.ogImage || undefined },
    en: {
      title: form.enTitle,
      subtitle: form.enSubtitle || undefined,
      body: form.enBody,
      slug: form.enSlug || undefined,
      seoTitle: form.enSeoTitle || undefined,
      seoDescription: form.enSeoDescription || undefined
    },
    kn: {
      title: form.knTitle,
      subtitle: form.knSubtitle || undefined,
      body: form.knBody,
      slug: form.knSlug || undefined,
      seoTitle: form.knSeoTitle || undefined,
      seoDescription: form.knSeoDescription || undefined
    }
  };
}

export function ArticleForm({ articleId }: { articleId?: string }) {
  const router = useRouter();
  const { user, refresh } = useAdminAuth();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [article, setArticle] = useState<Article | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(Boolean(articleId));

  const load = useCallback(async () => {
    if (!articleId) return;
    setLoading(true);
    try {
      const data = await adminApi.get(articleId);
      setArticle(data);
      setForm(toFormState(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the article");
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    void load();
  }, [load]);

  const editable =
    !article ||
    ["DRAFT", "REJECTED"].includes(article.status) ||
    can(user, "articles:review") ||
    can(user, "articles:publish");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await persist();
  }

  async function persist(): Promise<Article | null> {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const payload = toPayload(form);
      const saved = articleId ? await adminApi.update(articleId, payload) : await adminApi.create(payload);
      setArticle(saved);
      setForm(toFormState(saved));
      setMessage(articleId ? "Changes saved." : "Draft created.");
      await refresh();
      if (articleId) {
        // Mutations return the article without its audit trail; reload the full view.
        await load();
      } else {
        router.replace(`/admin/articles/${saved.id}` as Route);
      }
      return saved;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the article");
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function saveAndSubmit() {
    const saved = await persist();
    if (!saved) return;
    setBusy(true);
    try {
      const submitted = await adminApi.submit(saved.id);
      setArticle(submitted);
      setMessage("Submitted for review. An editor will pick it up from the review queue.");
      await refresh();
      if (articleId) await load();
      else router.replace(`/admin/articles/${submitted.id}` as Route);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit for review");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="text-sm font-semibold text-black/50">Loading article…</div>;

  const canSubmit = can(user, "articles:submit") && (!article || ["DRAFT", "REJECTED"].includes(article.status));

  return (
    <div className="min-w-0">
      <PageHeader
        eyebrow={articleId ? "Edit" : "Create"}
        title={articleId ? form.enTitle || form.slug || "Edit Article" : "New Article"}
        actions={
          <>
            {article && <StatusBadge status={article.status} />}
            {article?.status === "REVIEW" && can(user, "articles:review") && (
              <Link
                href={`/admin/articles/review/${article.id}` as Route}
                className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-bold text-white"
              >
                Open review
              </Link>
            )}
          </>
        }
      />

      {article?.reviewNote && (
        <div className="mt-5">
          <Notice tone={article.status === "REJECTED" ? "error" : "info"}>
            Editor note: {article.reviewNote}
          </Notice>
        </div>
      )}
      {message && (
        <div className="mt-5">
          <Notice tone="success">{message}</Notice>
        </div>
      )}
      {error && (
        <div className="mt-5">
          <Notice tone="error">{error}</Notice>
        </div>
      )}

      {!editable && (
        <div className="mt-5">
          <Notice>This article is in {article?.status} and can no longer be edited by you.</Notice>
        </div>
      )}

      <form onSubmit={save} className="mt-6 grid min-w-0 gap-6 lg:grid-cols-2">
        <fieldset disabled={!editable || busy} className="contents">
          <section className="min-w-0 rounded-lg border bg-white p-4 shadow-editorial sm:p-6 lg:col-span-2">
            <h2 className="mb-4 text-sm font-bold uppercase text-black/50">Article settings</h2>
            <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Slug" value={form.slug} onChange={(slug) => setForm({ ...form, slug })} required />
              <Field
                label="Category Slug"
                value={form.categorySlug}
                onChange={(categorySlug) => setForm({ ...form, categorySlug })}
                required
              />
              <Field
                label="Category Name"
                value={form.categoryName}
                onChange={(categoryName) => setForm({ ...form, categoryName })}
                required
              />
              <Field
                label="District Slug"
                value={form.districtSlug}
                onChange={(districtSlug) => setForm({ ...form, districtSlug })}
              />
            </div>
            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
              <Field
                label="Featured Image URL"
                value={form.featuredImage}
                onChange={(featuredImage) => setForm({ ...form, featuredImage })}
              />
              <Field
                label="Tags (comma separated)"
                value={form.tags}
                onChange={(tags) => setForm({ ...form, tags })}
              />
              <Field
                label="Canonical URL"
                value={form.canonicalUrl}
                onChange={(canonicalUrl) => setForm({ ...form, canonicalUrl })}
              />
              <Field label="OG Image" value={form.ogImage} onChange={(ogImage) => setForm({ ...form, ogImage })} />
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isBreaking}
                  onChange={(event) => setForm({ ...form, isBreaking: event.target.checked })}
                />
                Breaking
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(event) => setForm({ ...form, isFeatured: event.target.checked })}
                />
                Featured
              </label>
            </div>
          </section>

          <TranslationPanel language="English" prefix="en" form={form} setForm={setForm} />
          <TranslationPanel language="ಕನ್ನಡ (Kannada)" prefix="kn" form={form} setForm={setForm} />

          <div className="flex flex-wrap gap-3 lg:col-span-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              <Save size={16} /> {busy ? "Saving…" : articleId ? "Save changes" : "Save draft"}
            </button>
            {canSubmit && (
              <button
                type="button"
                onClick={saveAndSubmit}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
              >
                <Send size={16} /> Save &amp; submit for review
              </button>
            )}
          </div>
        </fieldset>
      </form>

      {article && (
        <>
          <div className="mt-8">
            <WorkflowActions
              article={article}
              onDone={async () => {
                await load();
                await refresh();
              }}
            />
          </div>

          <section className="mt-8 rounded-lg border bg-white p-4 shadow-editorial sm:p-6">
            <h2 className="mb-4 text-sm font-bold uppercase text-black/50">Audit trail</h2>
            <ul className="space-y-3 text-sm">
              {(article.auditLogs || []).map((entry) => (
                <li key={entry.id} className="flex flex-wrap items-center gap-2 border-b pb-3 last:border-0">
                  <CheckCircle2 size={15} className="text-black/30" />
                  <span className="font-bold">{entry.action.replaceAll("_", " ")}</span>
                  {entry.oldStatus && (
                    <span className="text-black/50">
                      {entry.oldStatus} → {entry.newStatus}
                    </span>
                  )}
                  <span className="text-black/50">by {entry.actor?.name || "system"}</span>
                  <span className="ml-auto text-[11px] text-black/40">{formatDateTime(entry.createdAt)}</span>
                  {entry.note && <p className="w-full text-xs text-black/60">“{entry.note}”</p>}
                </li>
              ))}
              {!article.auditLogs?.length && <li className="text-black/50">No activity recorded yet.</li>}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="mt-4 block min-w-0 text-sm font-semibold">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="mt-1 w-full rounded-lg border px-3 py-2 disabled:bg-neutral-100"
      />
    </label>
  );
}

function TranslationPanel({
  language,
  prefix,
  form,
  setForm
}: {
  language: string;
  prefix: "en" | "kn";
  form: FormState;
  setForm: (form: FormState) => void;
}) {
  const key = (suffix: string) => `${prefix}${suffix}` as keyof FormState;
  const text = (suffix: string) => String(form[key(suffix)] ?? "");
  const set = (suffix: string, value: string) => setForm({ ...form, [key(suffix)]: value });

  return (
    <section className={`min-w-0 rounded-lg border bg-white p-4 shadow-editorial sm:p-6 ${prefix === "kn" ? "font-kannada" : ""}`}>
      <h2 className="headline text-2xl">{language}</h2>
      <Field label="Title" value={text("Title")} onChange={(value) => set("Title", value)} required />
      <Field label="Subtitle" value={text("Subtitle")} onChange={(value) => set("Subtitle", value)} />
      <label className="mt-4 block text-sm font-semibold">
        Body
        <textarea
          value={text("Body")}
          onChange={(event) => set("Body", event.target.value)}
          required
          rows={12}
          className="mt-1 w-full resize-y rounded-lg border px-3 py-2 disabled:bg-neutral-100"
        />
      </label>
      <Field label="URL slug" value={text("Slug")} onChange={(value) => set("Slug", value)} />
      <Field label="SEO Title" value={text("SeoTitle")} onChange={(value) => set("SeoTitle", value)} />
      <Field label="SEO Description" value={text("SeoDescription")} onChange={(value) => set("SeoDescription", value)} />
    </section>
  );
}
