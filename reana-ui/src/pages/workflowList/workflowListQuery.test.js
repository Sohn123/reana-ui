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
  ["mine", { shared: false, sharedBy: undefined, sharedWith: undefined }],
  [
    "shared-with-me",
    { shared: false, sharedBy: "anybody", sharedWith: undefined },
  ],
])("serializes the %s workflow scope", (category, expected) => {
  const params = serializeQueryToApiParams({
    ...parseWorkflowListQuery(new URLSearchParams()),
    category,
  });

  expect(params).toMatchObject(expected);
});

test.each([
  [undefined, undefined],
  ["nobody", "nobody"],
  ["anybody", "anybody"],
  ["alice@example.org", "alice@example.org"],
])("serializes the owned workflow sharing refinement %s", (value, expected) => {
  const params = serializeQueryToApiParams({
    ...parseWorkflowListQuery(new URLSearchParams()),
    sharedWithUser: value,
  });

  expect(params).toMatchObject({
    shared: false,
    sharedBy: undefined,
    sharedWith: expected,
  });
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
  [{ "shared-with": "true" }, "mine"],
  [{ "shared-by": "alice@example.org" }, "shared-with-me"],
])("preserves legacy sharing URLs", (params, expectedCategory) => {
  expect(parseWorkflowListQuery(new URLSearchParams(params)).category).toBe(
    expectedCategory,
  );
});

test.each([
  [{}, undefined],
  [{ category: "all" }, undefined],
  [{ category: "all", shared: "true" }, undefined],
  [{ category: "i-shared" }, "anybody"],
  [{ category: "i-shared", "shared-by": "alice@example.org" }, "anybody"],
  [{ "shared-with": "true" }, "anybody"],
])(
  "parses legacy owned workflow views into the sharing refinement",
  (params, expectedSharedWithUser) => {
    const query = parseWorkflowListQuery(new URLSearchParams(params));

    expect(query.category).toBe("mine");
    expect(query.sharedWithUser).toBe(expectedSharedWithUser);
  },
);
