/**
 * Single source of truth for editorial roles and permissions.
 * Role names are also rows in the `Role` table (see prisma/seed.ts); the
 * permission mapping lives here so guards can resolve it without a query.
 */

export const PERMISSIONS = [
  "articles:create",
  "articles:edit",
  "articles:submit",
  "articles:review",
  "articles:approve",
  "articles:publish",
  "articles:delete"
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "EDITOR",
  "SUB_EDITOR",
  "REPORTER",
  "TRANSLATOR",
  "FACT_CHECKER",
  "MODERATOR",
  "PHOTOGRAPHER",
  "VIDEO_EDITOR"
] as const;

export type RoleName = (typeof ROLES)[number];

const ALL: Permission[] = [...PERMISSIONS];

export const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  SUPER_ADMIN: ALL,
  ADMIN: ALL,
  EDITOR: [
    "articles:create",
    "articles:edit",
    "articles:submit",
    "articles:review",
    "articles:approve",
    "articles:publish"
  ],
  SUB_EDITOR: ["articles:create", "articles:edit", "articles:submit", "articles:review", "articles:approve"],
  REPORTER: ["articles:create", "articles:edit", "articles:submit"],
  TRANSLATOR: ["articles:edit"],
  FACT_CHECKER: ["articles:review"],
  MODERATOR: [],
  PHOTOGRAPHER: ["articles:create"],
  VIDEO_EDITOR: ["articles:create"]
};

/** Roles allowed to touch any article rather than only the ones they own. */
const NEWSROOM_WIDE: RoleName[] = ["SUPER_ADMIN", "ADMIN", "EDITOR", "SUB_EDITOR"];

export function isRoleName(value: string): value is RoleName {
  return (ROLES as readonly string[]).includes(value);
}

export function permissionsFor(roles: string[]): Permission[] {
  const granted = new Set<Permission>();
  for (const role of roles) {
    if (!isRoleName(role)) continue;
    for (const permission of ROLE_PERMISSIONS[role]) granted.add(permission);
  }
  return [...granted];
}

export function hasPermission(roles: string[], permission: Permission): boolean {
  return permissionsFor(roles).includes(permission);
}

/** True when the actor may act on articles they do not own. */
export function canManageOthersArticles(roles: string[]): boolean {
  return roles.some((role) => isRoleName(role) && NEWSROOM_WIDE.includes(role));
}
