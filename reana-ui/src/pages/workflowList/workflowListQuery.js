/*
  -*- coding: utf-8 -*-

  This file is part of REANA.
  Copyright (C) 2026 CERN.

  REANA is free software; you can redistribute it and/or modify it
  under the terms of the MIT License; see LICENSE file for more details.
*/

import { NON_DELETED_STATUSES, WORKFLOW_STATUSES } from "~/config";

export const WORKFLOW_LIST_PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100].map(
  (size) => ({
    key: size,
    text: String(size),
    value: size,
  }),
);

export const WORKFLOW_LIST_DEFAULT_PAGE_SIZE =
  WORKFLOW_LIST_PAGE_SIZE_OPTIONS[1].value;

export const WORKFLOW_LIST_CATEGORIES = ["mine", "shared-with-me"];
export const WORKFLOW_LIST_DEFAULT_CATEGORY = "mine";

const isPositiveInteger = (value) => Number.isFinite(value) && value > 0;
const isValidStatus = (status) =>
  status && WORKFLOW_STATUSES.includes(status) && status !== "deleted";

/**
 * Normalized workflow list query state parsed from URL search parameters.
 *
 * URL Parameter Contract:
 * - category: "mine" | "shared-with-me" or absent (default: "mine")
 * - page: positive integer or absent (default: 1)
 * - page-size: positive integer or absent (default: 10)
 * - search: string or absent
 * - sort: "asc" | "desc" | "disk-desc" | "cpu-desc" or absent (default: "desc")
 * - status: workflow status or absent
 * - show-deleted: "true" to include deleted runs or absent
 * - open-sessions: "true" or absent
 *
 * Shared-with-me category only:
 * - shared-by: user email or absent (default: anybody)
 *
 * Mine category only:
 * - shared-with-user: "nobody" | "anybody" | user email or absent (default: all)
 *
 */
export function parseWorkflowListQuery(searchParams) {
  const rawPage = Number.parseInt(searchParams.get("page") || "", 10);
  const page = isPositiveInteger(rawPage) ? rawPage : 1;

  const rawPageSize = Number.parseInt(searchParams.get("page-size") || "", 10);
  const pageSize = isPositiveInteger(rawPageSize)
    ? rawPageSize
    : WORKFLOW_LIST_DEFAULT_PAGE_SIZE;

  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "desc";

  // Determine category. Explicit ?category= takes priority
  const rawCategory = searchParams.get("category");
  let category;
  if (rawCategory === "all" || rawCategory === "i-shared") {
    category = "mine";
  } else if (WORKFLOW_LIST_CATEGORIES.includes(rawCategory)) {
    category = rawCategory;
  } else if (
    searchParams.get("shared") === "true" ||
    searchParams.get("shared-by")
  ) {
    category = "shared-with-me";
  } else {
    category = WORKFLOW_LIST_DEFAULT_CATEGORY;
  }

  const includeDeleted = searchParams.get("show-deleted") === "true";
  const showOpenSessionsOnly = searchParams.get("open-sessions") === "true";
  const rawStatus = searchParams.get("status");
  const status = isValidStatus(rawStatus) ? rawStatus : undefined;
  const hasStatusFilter =
    searchParams.has("status") && isValidStatus(rawStatus);

  // User filter for "shared with me" category (who shared with me)
  const sharedByUser =
    category === "shared-with-me"
      ? searchParams.get("shared-by") || "anybody"
      : undefined;

  // Sharing refinement for owned workflows
  const sharedWithUser =
    category === "mine"
      ? searchParams.get("shared-with-user") ||
        (rawCategory === "i-shared" ||
        searchParams.get("shared-with") === "true"
          ? "anybody"
          : undefined)
      : undefined;

  return {
    page,
    pageSize,
    search,
    sort,
    category,
    includeDeleted,
    showOpenSessionsOnly,
    status,
    hasStatusFilter,
    sharedByUser,
    sharedWithUser,
  };
}

/**
 * Serializes the normalized query model to API request parameters.
 * The active category drives which shared/sharedBy/sharedWith API params are sent.
 */
export function serializeQueryToApiParams(query) {
  let shared, sharedBy, sharedWith;

  if (query.category === "shared-with-me") {
    // shared_by="anybody" returns ONLY workflows others shared with me (not the union).
    shared = false;
    sharedBy = query.sharedByUser || "anybody";
    sharedWith = undefined;
  } else {
    // Owned workflows, optionally refined by who they are shared with.
    shared = false;
    sharedBy = undefined;
    sharedWith = query.sharedWithUser;
  }

  let status;
  if (query.hasStatusFilter && query.status) {
    status = query.includeDeleted ? [query.status, "deleted"] : [query.status];
  } else {
    status = query.includeDeleted ? undefined : NON_DELETED_STATUSES;
  }

  return {
    pagination: {
      page: query.page,
      size: query.pageSize,
    },
    search: query.search.trim() || undefined,
    status,
    shared,
    sharedBy,
    sharedWith,
    sort: query.sort,
    ...(query.showOpenSessionsOnly ? { type: "interactive" } : {}),
  };
}
