import { ArticleStatus } from "@prisma/client";

import type { Permission } from "../../common/rbac";

export type WorkflowAction =
  | "SUBMIT"
  | "APPROVE"
  | "REJECT"
  | "REQUEST_CHANGES"
  | "PUBLISH"
  | "SCHEDULE"
  | "ARCHIVE";

type TransitionRule = {
  from: ArticleStatus[];
  to: ArticleStatus;
  permission: Permission;
  /** Audit action recorded when the transition succeeds. */
  auditAction: string;
};

/**
 * The editorial state machine. Every status change in the API goes through
 * this table, so a reporter can never reach PUBLISHED regardless of the
 * endpoint they call.
 */
export const TRANSITIONS: Record<WorkflowAction, TransitionRule> = {
  SUBMIT: {
    from: [ArticleStatus.DRAFT, ArticleStatus.REJECTED],
    to: ArticleStatus.REVIEW,
    permission: "articles:submit",
    auditAction: "SUBMITTED_FOR_REVIEW"
  },
  APPROVE: {
    from: [ArticleStatus.REVIEW],
    to: ArticleStatus.APPROVED,
    permission: "articles:approve",
    auditAction: "APPROVED"
  },
  REJECT: {
    from: [ArticleStatus.REVIEW, ArticleStatus.APPROVED],
    to: ArticleStatus.REJECTED,
    permission: "articles:review",
    auditAction: "REJECTED"
  },
  REQUEST_CHANGES: {
    from: [ArticleStatus.REVIEW, ArticleStatus.APPROVED],
    to: ArticleStatus.DRAFT,
    permission: "articles:review",
    auditAction: "CHANGES_REQUESTED"
  },
  PUBLISH: {
    from: [ArticleStatus.APPROVED, ArticleStatus.SCHEDULED],
    to: ArticleStatus.PUBLISHED,
    permission: "articles:publish",
    auditAction: "PUBLISHED"
  },
  SCHEDULE: {
    from: [ArticleStatus.APPROVED, ArticleStatus.SCHEDULED],
    to: ArticleStatus.SCHEDULED,
    permission: "articles:publish",
    auditAction: "SCHEDULED"
  },
  ARCHIVE: {
    from: [ArticleStatus.PUBLISHED, ArticleStatus.SCHEDULED, ArticleStatus.REJECTED],
    to: ArticleStatus.ARCHIVED,
    permission: "articles:publish",
    auditAction: "ARCHIVED"
  }
};

/** Statuses a reporter-level author may still edit on their own article. */
export const AUTHOR_EDITABLE: ArticleStatus[] = [ArticleStatus.DRAFT, ArticleStatus.REJECTED];

/** Permission needed to edit an article sitting in a given status. */
export function editPermissionFor(status: ArticleStatus): Permission {
  if (status === ArticleStatus.PUBLISHED || status === ArticleStatus.SCHEDULED) return "articles:publish";
  if (status === ArticleStatus.REVIEW || status === ArticleStatus.APPROVED) return "articles:review";
  return "articles:edit";
}

/** Permission needed to create an article directly in a given status. */
export function createPermissionFor(status: ArticleStatus): Permission {
  if (status === ArticleStatus.PUBLISHED || status === ArticleStatus.SCHEDULED) return "articles:publish";
  if (status === ArticleStatus.APPROVED) return "articles:approve";
  if (status === ArticleStatus.REVIEW) return "articles:submit";
  return "articles:create";
}
