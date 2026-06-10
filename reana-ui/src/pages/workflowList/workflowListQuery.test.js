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
  ["not-shared", { shared: false, sharedBy: undefined, sharedWith: "nobody" }],
  [
    "shared-with-others",
    { shared: false, sharedBy: undefined, sharedWith: "anybody" },
  ],
  [
    "shared-with-you",
    { shared: false, sharedBy: "anybody", sharedWith: undefined },
  ],
])("serializes the %s sharing scope", (sharingScope, expected) => {
  const params = serializeQueryToApiParams({
    ...parseWorkflowListQuery(new URLSearchParams()),
    sharingScope,
  });

  expect(params).toMatchObject(expected);
});

test.each([
  ["shared-with-others", "shared-with-user", "alice@example.org", "sharedWith"],
  ["shared-with-you", "shared-by", "alice@example.org", "sharedBy"],
])(
  "serializes the contextual person filter for %s",
  (sharingScope, key, email, apiKey) => {
    const query = parseWorkflowListQuery(
      new URLSearchParams({ sharing: sharingScope, [key]: email }),
    );
    const params = serializeQueryToApiParams(query);

    expect(params[apiKey]).toBe(email);
  },
);

test("parses all supported workflow-list filters from the URL", () => {
  const query = parseWorkflowListQuery(
    new URLSearchParams({
      sharing: "shared-with-you",
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
    sharingScope: "shared-with-you",
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

test("default view includes all sharing states and excludes deleted runs", () => {
  const params = serializeQueryToApiParams(
    parseWorkflowListQuery(new URLSearchParams()),
  );

  expect(params.shared).toBe(true);
  expect(params.status).not.toContain("deleted");
});

test.each([
  [{}, "all"],
  [{ category: "all" }, "all"],
  [{ category: "mine" }, "all"],
  [{ shared: "true" }, "all"],
  [{ category: "i-shared" }, "shared-with-others"],
  [{ "shared-with": "true" }, "shared-with-others"],
  [{ "shared-with-user": "alice@example.org" }, "shared-with-others"],
  [{ category: "shared-with-me" }, "shared-with-you"],
  [{ "shared-by": "alice@example.org" }, "shared-with-you"],
])("maps legacy sharing URLs to %s", (params, expectedSharingScope) => {
  expect(parseWorkflowListQuery(new URLSearchParams(params)).sharingScope).toBe(
    expectedSharingScope,
  );
});
