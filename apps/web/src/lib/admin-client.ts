"use client";

import { API_BASE, type AdminUser, type Article, type ArticleStatus } from "./api";

export const TOKEN_KEY = "news_admin_token";

export function getToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(TOKEN_KEY) || "";
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {})
    }
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}) as { message?: string | string[] });
    const message = Array.isArray(body.message) ? body.message.join(", ") : body.message;
    throw new ApiError(message || `Request failed (${response.status})`, response.status);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const adminApi = {
  login: (email: string, password: string) =>
    request<{ accessToken: string; user: AdminUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),

  me: () => request<AdminUser>("/auth/me"),

  counts: () => request<Record<string, number>>("/admin/articles/counts"),

  list: (params: { status?: ArticleStatus | "ALL"; search?: string; take?: number; skip?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== "ALL") query.set("status", params.status);
    if (params.search) query.set("search", params.search);
    if (params.take) query.set("take", String(params.take));
    if (params.skip) query.set("skip", String(params.skip));
    const suffix = query.toString() ? `?${query}` : "";
    return request<{ items: Article[]; total: number }>(`/admin/articles${suffix}`);
  },

  get: (id: string) => request<Article>(`/admin/articles/${id}`),

  create: (payload: unknown) =>
    request<Article>("/articles", { method: "POST", body: JSON.stringify(payload) }),

  update: (id: string, payload: unknown) =>
    request<Article>(`/articles/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),

  submit: (id: string, note?: string) => transition(id, "submit", note),
  approve: (id: string, note?: string) => transition(id, "approve", note),
  reject: (id: string, note?: string) => transition(id, "reject", note),
  requestChanges: (id: string, note?: string) => transition(id, "request-changes", note),
  publish: (id: string, note?: string) => transition(id, "publish", note),
  schedule: (id: string, scheduledAt: string, note?: string) =>
    request<Article>(`/articles/${id}/schedule`, {
      method: "POST",
      body: JSON.stringify({ scheduledAt, note })
    }),

  remove: (id: string) => request<{ id: string }>(`/articles/${id}`, { method: "DELETE" })
};

function transition(id: string, action: string, note?: string) {
  return request<Article>(`/articles/${id}/${action}`, {
    method: "POST",
    body: JSON.stringify({ note })
  });
}

export function can(user: AdminUser | null, permission: string) {
  return Boolean(user?.permissions?.includes(permission));
}
