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
    text: `${size}`,
    value: size,
  }),
);

export const WORKFLOW_LIST_DEFAULT_PAGE_SIZE =
  WORKFLOW_LIST_PAGE_SIZE_OPTIONS[1].value;

const isPositiveInteger = (value) => Number.isFinite(value) && value > 0;
const isValidStatus = (status) =>
  status && WORKFLOW_STATUSES.includes(status) && status !== "deleted";

/**
 * Normalized workflow list query state parsed from URL search parameters.
 *
 * URL Parameter Contract:
 * - page: positive integer or absent (default: 1)
 * - page-size: positive integer or absent (default: 10)
 * - search: string or absent
 * - sort: "asc" | "desc" | "disk-desc" | "cpu-desc" or absent (default: "desc")
 * - status: workflow status or absent
 * - show-deleted: "true" or absent
 * - open-sessions: "true" or absent
 *
 * Sharing (mutually exclusive; shared-with takes priority):
 * - shared-with: "nobody" | "anybody" | email — owned-workflow refinement
 * - owned-by: "anybody" | email — workflows not owned by the current user
 *
 *
 * Legacy params (read-only, never written):
 * - ?shared=true              → ownedBy="anybody"
 * - ?shared-with=true         → sharedWith="anybody"
 * - ?shared-by=<email>        → ownedBy=<email>
 * - ?owned-by=you             → ownedBy=undefined (default "mine" view)

 * Missing sharing params default to ownedBy=undefined (default "mine" view).
 */
export function parseWorkflowListQuery(searchParams) {
  const rawPage = Number.parseInt(searchParams.get("page") || "", 10);

  const rawPageSize = Number.parseInt(searchParams.get("page-size") || "", 10);
  const pageSize = isPositiveInteger(rawPageSize)
    ? rawPageSize
    : WORKFLOW_LIST_DEFAULT_PAGE_SIZE;

  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "desc";

  const includeDeleted = searchParams.get("show-deleted") === "true";
  const showOpenSessionsOnly = searchParams.get("open-sessions") === "true";
  const rawStatus = searchParams.get("status");
  // Handle legacy "deleted" status filter, which is now represented by the "show-deleted" param.
  // We reset the page to 1 to avoid a data race
  const page =
    rawStatus === "deleted" || !isPositiveInteger(rawPage) ? 1 : rawPage;
  const status = isValidStatus(rawStatus) ? rawStatus : undefined;
  const hasStatusFilter =
    searchParams.has("status") && isValidStatus(rawStatus);

  // shared-with takes priority over owned-by
  const rawSharedWith = searchParams.get("shared-with");
  let sharedWith;
  if (rawSharedWith === "true")
    sharedWith = "anybody"; // legacy
  else if (rawSharedWith) sharedWith = rawSharedWith;
  else sharedWith = undefined;

  let ownedBy;
  if (sharedWith !== undefined) {
    ownedBy = undefined; // irrelevant when refining owned workflows
  } else {
    const rawOwnedBy = searchParams.get("owned-by");
    const rawSharedBy = searchParams.get("shared-by"); // legacy
    if (rawOwnedBy && rawOwnedBy !== "you") ownedBy = rawOwnedBy;
    else if (rawSharedBy)
      ownedBy = rawSharedBy; // legacy
    else if (searchParams.get("shared") === "true")
      ownedBy = "anybody"; // legacy
    else ownedBy = undefined;
  }

  return {
    page,
    pageSize,
    search,
    sort,
    includeDeleted,
    showOpenSessionsOnly,
    status,
    hasStatusFilter,
    ownedBy,
    sharedWith,
  };
}

/**
 * Serializes the normalized query model to API request parameters.
 */
export function serializeQueryToApiParams(query) {
  let shared, ownedBy, sharedWith;

  if (query.sharedWith !== undefined) {
    // Owned workflows, optionally refined by who they are shared with.
    shared = false;
    ownedBy = undefined;
    sharedWith = query.sharedWith;
  } else if (query.ownedBy === "anybody") {
    // workflows not owned by the current user
    shared = false;
    ownedBy = "anybody";
    sharedWith = undefined;
  } else if (query.ownedBy) {
    // workflows not owned by the current user, shared by a specific user
    shared = false;
    ownedBy = query.ownedBy;
    sharedWith = undefined;
  } else {
    // mine only (default)
    shared = false;
    ownedBy = undefined;
    sharedWith = undefined;
  }

  let status;
  if (query.hasStatusFilter) {
    status = query.includeDeleted
      ? query.status
        ? [query.status, "deleted"]
        : ["deleted"]
      : query.status
        ? [query.status]
        : undefined;
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
    sharedBy: ownedBy,
    sharedWith,
    sort: query.sort,
    ...(query.showOpenSessionsOnly ? { type: "interactive" } : {}),
  };
}
