/*
  -*- coding: utf-8 -*-

  This file is part of REANA.
  Copyright (C) 2026 CERN.

  REANA is free software; you can redistribute it and/or modify it
  under the terms of the MIT License; see LICENSE file for more details.
*/

import {
  parseWorkflowListQuery,
  serializeQueryToApiParams,
} from "./workflowListQuery";

test.each([
  ["all", { shared: true, sharedBy: undefined, sharedWith: undefined }],
  ["mine", { shared: false, sharedBy: undefined, sharedWith: undefined }],
  [
    "shared-with-me",
    { shared: false, sharedBy: "anybody", sharedWith: undefined },
  ],
  ["i-shared", { shared: false, sharedBy: undefined, sharedWith: "anybody" }],
])("serializes the %s workflow scope", (category, expected) => {
  const params = serializeQueryToApiParams({
    ...parseWorkflowListQuery(new URLSearchParams()),
    category,
  });

  expect(params).toMatchObject(expected);
});

test("parses all supported workflow-list filters from the URL", () => {
  const query = parseWorkflowListQuery(
    new URLSearchParams({
      category: "shared-with-me",
      "shared-by": "alice@example.org",
      page: "3",
      "page-size": "20",
      search: "analysis",
      sort: "cpu-desc",
      status: "running",
      "show-deleted": "true",
      "open-sessions": "true",
    }),
  );

  expect(query).toMatchObject({
    category: "shared-with-me",
    sharedByUser: "alice@example.org",
    page: 3,
    pageSize: 20,
    search: "analysis",
    sort: "cpu-desc",
    status: "running",
    hasStatusFilter: true,
    includeDeleted: true,
    showOpenSessionsOnly: true,
  });
});

test("show deleted adds deleted runs to the selected status", () => {
  const params = serializeQueryToApiParams({
    ...parseWorkflowListQuery(
      new URLSearchParams({
        "show-deleted": "true",
        status: "running",
        "open-sessions": "true",
      }),
    ),
  });

  expect(params.status).toEqual(["running", "deleted"]);
  expect(params.type).toBe("interactive");
});

test("default view excludes deleted runs", () => {
  const params = serializeQueryToApiParams(
    parseWorkflowListQuery(new URLSearchParams()),
  );

  expect(params.status).not.toContain("deleted");
});

test.each([
  [{ shared: "true" }, "shared-with-me"],
  [{ "shared-with": "true" }, "i-shared"],
  [{ "shared-by": "alice@example.org" }, "shared-with-me"],
])("preserves legacy sharing URLs", (params, expectedCategory) => {
  expect(parseWorkflowListQuery(new URLSearchParams(params)).category).toBe(
    expectedCategory,
  );
});
