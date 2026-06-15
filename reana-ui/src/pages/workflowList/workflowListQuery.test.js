/*
  This file is part of REANA.
  Copyright (C) 2026 CERN.

  REANA is free software; you can redistribute it and/or modify it
  under the terms of the MIT License; see LICENSE file for more details.
*/

import { useEffect } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";

import { NON_DELETED_STATUSES } from "~/config";
import { useWorkflowListQuery } from "./useWorkflowListQuery";
import {
  parseWorkflowListQuery,
  serializeQueryToApiParams,
  WORKFLOW_LIST_DEFAULT_PAGE_SIZE,
} from "./workflowListQuery";

const parseQuery = (queryString) =>
  parseWorkflowListQuery(new URLSearchParams(queryString));

const serializeQueryString = (queryString) =>
  serializeQueryToApiParams(parseQuery(queryString));

function WorkflowListQueryProbe({ onChange }) {
  const workflowListQuery = useWorkflowListQuery();
  const location = useLocation();

  useEffect(() => {
    onChange({ location, workflowListQuery });
  }, [location, onChange, workflowListQuery]);

  return (
    <>
      <button
        onClick={() => workflowListQuery.setSharing(undefined, undefined)}
      >
        Owned by you
      </button>
      <button
        onClick={() => workflowListQuery.setSharing("anybody", undefined)}
      >
        Owned by anybody
      </button>
    </>
  );
}

function renderWorkflowListQuery(initialEntry) {
  const snapshots = [];
  const onChange = (snapshot) => snapshots.push(snapshot);

  render(
    <MemoryRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
      initialEntries={[initialEntry]}
    >
      <WorkflowListQueryProbe onChange={onChange} />
    </MemoryRouter>,
  );

  return {
    latest: () => snapshots[snapshots.length - 1],
  };
}

describe("parseWorkflowListQuery", () => {
  it("defaults to your workflows with no sharing refinement", () => {
    const query = parseQuery("");

    expect(query).toEqual(
      expect.objectContaining({
        page: 1,
        pageSize: WORKFLOW_LIST_DEFAULT_PAGE_SIZE,
        ownedBy: undefined,
        sharedWith: undefined,
      }),
    );
    expect(serializeQueryToApiParams(query)).toEqual(
      expect.objectContaining({
        shared: false,
        sharedBy: undefined,
        sharedWith: undefined,
        status: NON_DELETED_STATUSES,
      }),
    );
  });

  it("supports legacy shared=true as shared workflows", () => {
    const query = parseQuery("shared=true");

    expect(query).toEqual(
      expect.objectContaining({
        ownedBy: "anybody",
        sharedWith: undefined,
      }),
    );
    expect(serializeQueryToApiParams(query)).toEqual(
      expect.objectContaining({
        shared: false,
        sharedBy: "anybody",
        sharedWith: undefined,
      }),
    );
  });

  it("supports private owned workflows", () => {
    expect(serializeQueryString("shared-with=nobody")).toEqual(
      expect.objectContaining({
        shared: false,
        sharedBy: undefined,
        sharedWith: "nobody",
      }),
    );
  });

  it("supports legacy shared-with=true as shared with anybody", () => {
    const query = parseQuery("shared-with=true");

    expect(query).toEqual(
      expect.objectContaining({
        ownedBy: undefined,
        sharedWith: "anybody",
      }),
    );
    expect(serializeQueryToApiParams(query)).toEqual(
      expect.objectContaining({
        shared: false,
        sharedBy: undefined,
        sharedWith: "anybody",
      }),
    );
  });

  it("lets shared-with take priority over owned-by", () => {
    const query = parseQuery("owned-by=you&shared-with=alice@example.org");

    expect(query).toEqual(
      expect.objectContaining({
        ownedBy: undefined,
        sharedWith: "alice@example.org",
      }),
    );
    expect(serializeQueryToApiParams(query)).toEqual(
      expect.objectContaining({
        shared: false,
        sharedBy: undefined,
        sharedWith: "alice@example.org",
      }),
    );
  });

  it("supports legacy shared-by as owned-by", () => {
    expect(serializeQueryString("shared-by=alice@example.org")).toEqual(
      expect.objectContaining({
        shared: false,
        sharedBy: "alice@example.org",
        sharedWith: undefined,
      }),
    );
  });

  it("resets page when dropping legacy status=deleted", () => {
    const query = parseQuery("status=deleted&page=2");

    expect(query).toEqual(
      expect.objectContaining({
        page: 1,
        status: undefined,
        hasStatusFilter: false,
      }),
    );
    expect(serializeQueryToApiParams(query)).toEqual(
      expect.objectContaining({
        pagination: {
          page: 1,
          size: WORKFLOW_LIST_DEFAULT_PAGE_SIZE,
        },
        status: NON_DELETED_STATUSES,
      }),
    );
  });
});

describe("useWorkflowListQuery", () => {
  it("removes invalid page parameters and normalizes the query page to 1", async () => {
    const { latest } = renderWorkflowListQuery("/workflows?page=abc");

    await waitFor(() => {
      expect(latest().location.search).toBe("");
    });
    expect(latest().workflowListQuery.query.page).toBe(1);
  });

  it("removes status=deleted and resets the current page", async () => {
    const { latest } = renderWorkflowListQuery(
      "/workflows?status=deleted&page=2",
    );

    await waitFor(() => {
      expect(latest().location.search).toBe("");
    });
    expect(latest().workflowListQuery.query).toEqual(
      expect.objectContaining({
        page: 1,
        status: undefined,
        hasStatusFilter: false,
      }),
    );
  });

  it("switches from shared-with mode to owned by you and resets pagination", async () => {
    const { latest } = renderWorkflowListQuery(
      "/workflows?shared-with=anybody&page=3",
    );

    fireEvent.click(screen.getByRole("button", { name: "Owned by you" }));

    await waitFor(() => {
      expect(latest().location.search).toBe("");
    });
    expect(latest().workflowListQuery.query).toEqual(
      expect.objectContaining({
        page: 1,
        ownedBy: undefined,
        sharedWith: undefined,
      }),
    );
  });

  it("writes owned-by=anybody explicitly because the empty URL defaults to your workflows", async () => {
    const { latest } = renderWorkflowListQuery("/workflows?page=3");

    fireEvent.click(screen.getByRole("button", { name: "Owned by anybody" }));

    await waitFor(() => {
      expect(latest().location.search).toBe("?owned-by=anybody");
    });
    expect(latest().workflowListQuery.query).toEqual(
      expect.objectContaining({
        page: 1,
        ownedBy: "anybody",
        sharedWith: undefined,
      }),
    );
  });
});
