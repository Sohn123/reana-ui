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

export const WORKFLOW_LIST_SHARING_SCOPES = [
  "all",
  "not-shared",
  "shared-with-others",
  "shared-with-you",
];
export const WORKFLOW_LIST_DEFAULT_SHARING_SCOPE = "all";

const isPositiveInteger = (value) => Number.isFinite(value) && value > 0;
const isValidStatus = (status) =>
  status && WORKFLOW_STATUSES.includes(status) && status !== "deleted";

/**
 * Normalized workflow list query state parsed from URL search parameters.
 *
 * URL Parameter Contract:
 * - sharing: "not-shared" | "shared-with-others" | "shared-with-you"
 *   or absent (default: "all")
 * - page: positive integer or absent (default: 1)
 * - page-size: positive integer or absent (default: 10)
 * - search: string or absent
 * - sort: "asc" | "desc" | "disk-desc" | "cpu-desc" or absent (default: "desc")
 * - status: workflow status or absent
 * - show-deleted: "true" to include deleted runs or absent
 * - open-sessions: "true" or absent
 *
 * Shared-with-you scope only:
 * - shared-by: user email or absent (default: anybody)
 *
 * Shared-with-others scope only:
 * - shared-with-user: user email or absent (default: anybody)
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

  // Determine sharing scope, including legacy sharing/category URLs.
  const rawSharingScope = searchParams.get("sharing");
  const rawCategory = searchParams.get("category");
  let sharingScope;
  if (WORKFLOW_LIST_SHARING_SCOPES.includes(rawSharingScope)) {
    sharingScope = rawSharingScope;
  } else if (
    searchParams.get("shared-by") ||
    rawCategory === "shared-with-me"
  ) {
    sharingScope = "shared-with-you";
  } else if (
    searchParams.get("shared-with-user") ||
    searchParams.get("shared-with") === "true" ||
    rawCategory === "i-shared"
  ) {
    sharingScope = "shared-with-others";
  } else {
    sharingScope = WORKFLOW_LIST_DEFAULT_SHARING_SCOPE;
  }

  const includeDeleted = searchParams.get("show-deleted") === "true";
  const showOpenSessionsOnly = searchParams.get("open-sessions") === "true";
  const rawStatus = searchParams.get("status");
  const status = isValidStatus(rawStatus) ? rawStatus : undefined;
  const hasStatusFilter =
    searchParams.has("status") && isValidStatus(rawStatus);

  // Person who shared the workflow with the current user.
  const sharedByUser =
    sharingScope === "shared-with-you"
      ? searchParams.get("shared-by") || "anybody"
      : undefined;

  // Person the current user shared the workflow with.
  const sharedWithUser =
    sharingScope === "shared-with-others"
      ? searchParams.get("shared-with-user") || "anybody"
      : undefined;

  return {
    page,
    pageSize,
    search,
    sort,
    sharingScope,
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
 * The active sharing scope drives which shared/sharedBy/sharedWith API params are sent.
 */
export function serializeQueryToApiParams(query) {
  let shared, sharedBy, sharedWith;

  if (query.sharingScope === "not-shared") {
    shared = false;
    sharedBy = undefined;
    sharedWith = "nobody";
  } else if (query.sharingScope === "shared-with-others") {
    shared = false;
    sharedBy = undefined;
    sharedWith = query.sharedWithUser || "anybody";
  } else if (query.sharingScope === "shared-with-you") {
    shared = false;
    sharedBy = query.sharedByUser || "anybody";
    sharedWith = undefined;
  } else {
    // Union of owned workflows and workflows shared with the current user.
    shared = true;
    sharedBy = undefined;
    sharedWith = undefined;
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
