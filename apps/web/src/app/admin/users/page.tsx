"use client";

import { useEffect, useState } from "react";

import { PageHeader } from "@/components/admin/ui";
import { API_BASE } from "@/lib/api";
import { getToken } from "@/lib/admin-client";

type RoleRow = { name: string; permissions: string[] };
type UserRow = { id: string; email: string; name: string; status: string; roles: { name: string }[] };

export default function AdminUsersPage() {
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${getToken()}` };
    fetch(`${API_BASE}/users/roles`, { headers })
      .then((response) => (response.ok ? response.json() : []))
      .then(setRoles)
      .catch(() => setRoles([]));
    fetch(`${API_BASE}/users`, { headers })
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]));
  }, []);

  return (
    <div className="min-w-0">
      <PageHeader eyebrow="Access Control" title="Users & Roles" />

      <section className="mt-6 rounded-lg border bg-white shadow-editorial">
        <div className="border-b px-4 py-3 text-xs font-bold uppercase text-black/50">Newsroom users</div>
        <div className="responsive-table">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-[11px] uppercase text-black/50">
              <tr>
                <th className="px-4 py-3 font-bold">Name</th>
                <th className="px-4 py-3 font-bold">Email</th>
                <th className="px-4 py-3 font-bold">Roles</th>
                <th className="px-4 py-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="px-4 py-3 font-semibold">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.roles.map((role) => role.name).join(", ") || "—"}</td>
                  <td className="px-4 py-3">{user.status}</td>
                </tr>
              ))}
              {!users.length && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-black/50">
                    Only editors and administrators can list users.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 rounded-lg border bg-white shadow-editorial">
        <div className="border-b px-4 py-3 text-xs font-bold uppercase text-black/50">Permission matrix</div>
        <div className="responsive-table">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-[11px] uppercase text-black/50">
              <tr>
                <th className="px-4 py-3 font-bold">Role</th>
                <th className="px-4 py-3 font-bold">Permissions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.name} className="border-t align-top">
                  <td className="whitespace-nowrap px-4 py-3 font-bold">{role.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.map((permission) => (
                        <span key={permission} className="rounded-full border px-2 py-0.5 text-xs font-semibold">
                          {permission}
                        </span>
                      ))}
                      {!role.permissions.length && <span className="text-black/50">No article permissions</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
