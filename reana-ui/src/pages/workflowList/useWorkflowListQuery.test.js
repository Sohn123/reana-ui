/*
  -*- coding: utf-8 -*-

  This file is part of REANA.
  Copyright (C) 2026 CERN.

  REANA is free software; you can redistribute it and/or modify it
  under the terms of the MIT License; see LICENSE file for more details.
*/

import { act, renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";

import { useWorkflowListQuery } from "./useWorkflowListQuery";

const routerFutureFlags = {
  v7_relativeSplatPath: true,
  v7_startTransition: true,
};

const wrapper = ({ children }) => (
  <MemoryRouter future={routerFutureFlags}>{children}</MemoryRouter>
);
const wrapperWithEntry = (entry) =>
  function Wrapper({ children }) {
    return (
      <MemoryRouter future={routerFutureFlags} initialEntries={[entry]}>
        {children}
      </MemoryRouter>
    );
  };

test("selects an owned-workflow sharing refinement", async () => {
  const { result } = renderHook(() => useWorkflowListQuery(), { wrapper });

  act(() => result.current.setSharing(undefined, "anybody"));

  await waitFor(() => {
    expect(result.current.query.sharedWith).toBe("anybody");
  });
  expect(result.current.query.ownedBy).toBeUndefined();
  expect(result.current.requestParams.shared).toBe(false);
});

test("selects private owned workflows", async () => {
  const { result } = renderHook(() => useWorkflowListQuery(), { wrapper });

  act(() => result.current.setSharing(undefined, "nobody"));

  await waitFor(() => {
    expect(result.current.query.sharedWith).toBe("nobody");
  });
  expect(result.current.query.ownedBy).toBeUndefined();
  expect(result.current.requestParams).toMatchObject({
    shared: false,
    sharedBy: undefined,
    sharedWith: "nobody",
  });
});

test("switching tabs clears incompatible sharing refinements", async () => {
  const { result } = renderHook(() => useWorkflowListQuery(), {
    wrapper: wrapperWithEntry("/?shared-with=alice@example.org&page=3"),
  });

  act(() => result.current.setSharing("anybody", undefined));

  await waitFor(() => {
    expect(result.current.query.ownedBy).toBe("anybody");
    expect(result.current.query.sharedWith).toBeUndefined();
    expect(result.current.query.page).toBe(1);
  });
  expect(result.current.requestParams).toMatchObject({
    shared: false,
    sharedBy: "anybody",
    sharedWith: undefined,
  });

  act(() => result.current.setSharing(undefined, undefined));

  await waitFor(() => {
    expect(result.current.query.ownedBy).toBeUndefined();
    expect(result.current.query.sharedWith).toBeUndefined();
  });
});

test("normalizes a published legacy view while preserving unrelated filters", async () => {
  const { result } = renderHook(() => useWorkflowListQuery(), {
    wrapper: wrapperWithEntry(
      "/?shared-by=alice@example.org&page=3&status=running&search=analysis",
    ),
  });

  await waitFor(() => {
    expect(result.current.query.ownedBy).toBe("alice@example.org");
  });
  expect(result.current.query).toMatchObject({
    sharedWith: undefined,
    page: 3,
    search: "analysis",
    status: "running",
  });
});

test("removes only published legacy sharing parameters", async () => {
  const { result } = renderHook(
    () => ({
      workflowList: useWorkflowListQuery(),
      location: useLocation(),
    }),
    {
      wrapper: wrapperWithEntry(
        "/?shared=true&page=3&status=running&search=analysis",
      ),
    },
  );

  await waitFor(() => {
    expect(result.current.location.search).toContain("owned-by=anybody");
  });
  expect(result.current.location.search).not.toContain("shared=true");
  expect(result.current.location.search).toContain("page=3");
  expect(result.current.location.search).toContain("status=running");
  expect(result.current.location.search).toContain("search=analysis");
});

test("reports active filters from committed workflow query state", async () => {
  const { result } = renderHook(() => useWorkflowListQuery(), {
    wrapper: wrapperWithEntry("/?search=analysis&sort=cpu-desc&page-size=20"),
  });

  expect(result.current.hasActiveFilters).toBe(true);

  act(() => result.current.clearFilters());

  await waitFor(() => {
    expect(result.current.hasActiveFilters).toBe(false);
  });
});

test("clear filters restores the default view and preserves preferences", async () => {
  const { result } = renderHook(
    () => ({
      workflowList: useWorkflowListQuery(),
      location: useLocation(),
    }),
    {
      wrapper: wrapperWithEntry(
        "/?search=analysis&status=running&show-deleted=true&open-sessions=true&owned-by=alice@example.org&page=3&page-size=20&sort=cpu-desc&custom=value",
      ),
    },
  );

  act(() => {
    result.current.workflowList.setSearchText("unsubmitted draft");
    result.current.workflowList.clearFilters();
  });

  await waitFor(() => {
    expect(result.current.workflowList.hasActiveFilters).toBe(false);
  });
  expect(result.current.workflowList.searchText).toBe("");
  expect(result.current.workflowList.query).toMatchObject({
    page: 1,
    pageSize: 20,
    search: "",
    sort: "cpu-desc",
    hasStatusFilter: false,
    includeDeleted: false,
    showOpenSessionsOnly: false,
    ownedBy: "anybody",
    sharedWith: undefined,
  });
  expect(result.current.location.search).toContain("page-size=20");
  expect(result.current.location.search).toContain("sort=cpu-desc");
  expect(result.current.location.search).toContain("custom=value");
  expect(result.current.location.search).toContain("owned-by=anybody");
  expect(result.current.location.search).not.toContain("page=3");
  expect(result.current.location.search).not.toContain("search=");
  expect(result.current.location.search).not.toContain("status=");
});

test("clear filters removes published legacy sharing parameters", async () => {
  const { result } = renderHook(
    () => ({
      workflowList: useWorkflowListQuery(),
      location: useLocation(),
    }),
    {
      wrapper: wrapperWithEntry("/?shared-by=alice@example.org&shared=true"),
    },
  );

  act(() => result.current.workflowList.clearFilters());

  await waitFor(() => {
    expect(result.current.location.search).toBe("?owned-by=anybody");
  });
});
