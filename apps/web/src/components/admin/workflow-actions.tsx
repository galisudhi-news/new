"use client";

import { useState } from "react";
import { AlertTriangle, CalendarClock, CheckCircle2, Globe2, RotateCcw, Send, XCircle } from "lucide-react";

import { adminApi, can } from "@/lib/admin-client";
import type { Article } from "@/lib/api";
import { useAdminAuth } from "./admin-shell";
import { Notice } from "./ui";

type ActionKey = "submit" | "requestChanges" | "reject" | "approve" | "approveAndPublish" | "publish" | "schedule";

type ActionSpec = {
  key: ActionKey;
  label: string;
  icon: typeof Send;
  className: string;
  /** Publishing is irreversible for readers, so it always asks first. */
  confirm?: string;
  noteLabel?: string;
  noteRequired?: boolean;
  needsSchedule?: boolean;
};

const ACTIONS: Record<ActionKey, ActionSpec> = {
  submit: {
    key: "submit",
    label: "Submit for Review",
    icon: Send,
    className: "bg-brand-600 text-white",
    noteLabel: "Note for the editor (optional)"
  },
  requestChanges: {
    key: "requestChanges",
    label: "Request Changes",
    icon: RotateCcw,
    className: "border bg-white",
    noteLabel: "What needs to change?",
    noteRequired: true
  },
  reject: {
    key: "reject",
    label: "Reject",
    icon: XCircle,
    className: "border border-red-200 bg-red-50 text-red-700",
    noteLabel: "Reason for rejection",
    noteRequired: true
  },
  approve: {
    key: "approve",
    label: "Approve",
    icon: CheckCircle2,
    className: "bg-emerald-600 text-white",
    noteLabel: "Approval note (optional)"
  },
  approveAndPublish: {
    key: "approveAndPublish",
    label: "Approve & Publish",
    icon: Globe2,
    className: "bg-black text-white",
    confirm: "This approves the article and puts it live on the public website immediately. Continue?",
    noteLabel: "Publishing note (optional)"
  },
  publish: {
    key: "publish",
    label: "Publish",
    icon: Globe2,
    className: "bg-black text-white",
    confirm: "This puts the article live on the public website immediately. Continue?",
    noteLabel: "Publishing note (optional)"
  },
  schedule: {
    key: "schedule",
    label: "Schedule",
    icon: CalendarClock,
    className: "border bg-white",
    needsSchedule: true,
    noteLabel: "Scheduling note (optional)"
  }
};

export function WorkflowActions({
  article,
  onDone,
  compact = false
}: {
  article: Article;
  onDone: (article: Article) => void | Promise<void>;
  compact?: boolean;
}) {
  const { user } = useAdminAuth();
  const [pending, setPending] = useState<ActionSpec | null>(null);
  const [note, setNote] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const available = availableActions(article, {
    submit: can(user, "articles:submit") && isOwn(article, user?.id),
    review: can(user, "articles:review"),
    approve: can(user, "articles:approve"),
    publish: can(user, "articles:publish")
  });

  async function run(spec: ActionSpec) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      let updated: Article;
      switch (spec.key) {
        case "submit":
          updated = await adminApi.submit(article.id, note || undefined);
          break;
        case "requestChanges":
          updated = await adminApi.requestChanges(article.id, note);
          break;
        case "reject":
          updated = await adminApi.reject(article.id, note);
          break;
        case "approve":
          updated = await adminApi.approve(article.id, note || undefined);
          break;
        case "approveAndPublish":
          await adminApi.approve(article.id, note || undefined);
          updated = await adminApi.publish(article.id, note || undefined);
          break;
        case "publish":
          updated = await adminApi.publish(article.id, note || undefined);
          break;
        case "schedule":
          updated = await adminApi.schedule(article.id, new Date(scheduledAt).toISOString(), note || undefined);
          break;
      }
      setMessage(`${spec.label} done — article is now ${updated.status}.`);
      setPending(null);
      setNote("");
      setScheduledAt("");
      await onDone(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Could not ${spec.label.toLowerCase()}`);
    } finally {
      setBusy(false);
    }
  }

  if (!available.length && !message) return null;

  return (
    <section className={compact ? "" : "rounded-lg border bg-white p-4 shadow-editorial sm:p-6"}>
      {!compact && <h2 className="mb-4 text-sm font-bold uppercase text-black/50">Editorial actions</h2>}

      {message && (
        <div className="mb-4">
          <Notice tone="success">{message}</Notice>
        </div>
      )}
      {error && (
        <div className="mb-4">
          <Notice tone="error">{error}</Notice>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {available.map((spec) => {
          const Icon = spec.icon;
          return (
            <button
              key={spec.key}
              type="button"
              disabled={busy}
              onClick={() => {
                setPending(spec);
                setNote("");
                setError("");
                setMessage("");
              }}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold disabled:opacity-60 ${spec.className}`}
            >
              <Icon size={16} /> {spec.label}
            </button>
          );
        })}
      </div>

      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg border bg-white p-5 shadow-editorial">
            <div className="flex items-center gap-2 text-lg font-bold">
              {pending.confirm && <AlertTriangle size={18} className="text-amber-500" />}
              {pending.label}
            </div>

            {pending.confirm && <p className="mt-2 text-sm text-black/70">{pending.confirm}</p>}

            {pending.needsSchedule && (
              <label className="mt-4 block text-sm font-semibold">
                Publish at
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(event) => setScheduledAt(event.target.value)}
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </label>
            )}

            {pending.noteLabel && (
              <label className="mt-4 block text-sm font-semibold">
                {pending.noteLabel}
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={3}
                  className="mt-1 w-full resize-y rounded-lg border px-3 py-2"
                />
              </label>
            )}

            {error && (
              <div className="mt-4">
                <Notice tone="error">{error}</Notice>
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPending(null)}
                className="rounded-lg border px-4 py-2 text-sm font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  busy ||
                  (pending.noteRequired && !note.trim()) ||
                  (pending.needsSchedule && !scheduledAt)
                }
                onClick={() => run(pending)}
                className={`rounded-lg px-4 py-2 text-sm font-bold disabled:opacity-50 ${pending.className}`}
              >
                {busy ? "Working…" : `Confirm ${pending.label}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function isOwn(article: Article, userId?: string) {
  if (!userId) return false;
  return article.author?.id === userId || article.reporter?.id === userId;
}

function availableActions(
  article: Article,
  grants: { submit: boolean; review: boolean; approve: boolean; publish: boolean }
): ActionSpec[] {
  const actions: ActionSpec[] = [];
  switch (article.status) {
    case "DRAFT":
    case "REJECTED":
      if (grants.submit) actions.push(ACTIONS.submit);
      break;
    case "REVIEW":
      if (grants.review) actions.push(ACTIONS.requestChanges, ACTIONS.reject);
      if (grants.approve) actions.push(ACTIONS.approve);
      if (grants.approve && grants.publish) actions.push(ACTIONS.approveAndPublish);
      break;
    case "APPROVED":
      if (grants.review) actions.push(ACTIONS.requestChanges, ACTIONS.reject);
      if (grants.publish) actions.push(ACTIONS.schedule, ACTIONS.publish);
      break;
    case "SCHEDULED":
      if (grants.publish) actions.push(ACTIONS.schedule, ACTIONS.publish);
      break;
    default:
      break;
  }
  return actions;
}
