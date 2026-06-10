/*
  -*- coding: utf-8 -*-

  This file is part of REANA.
  Copyright (C) 2026 CERN.

  REANA is free software; you can redistribute it and/or modify it
  under the terms of the MIT License; see LICENSE file for more details.
*/

import { act, renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { useWorkflowListQuery } from "./useWorkflowListQuery";

const wrapper = ({ children }) => <MemoryRouter>{children}</MemoryRouter>;
const wrapperWithEntry = (entry) =>
  function Wrapper({ children }) {
    return <MemoryRouter initialEntries={[entry]}>{children}</MemoryRouter>;
  };

test("selects a sharing scope and serializes its API parameters", async () => {
  const { result } = renderHook(() => useWorkflowListQuery(), { wrapper });

  act(() => result.current.setSharingScope("shared-with-others"));

  await waitFor(() => {
    expect(result.current.query.sharingScope).toBe("shared-with-others");
  });
  expect(result.current.requestParams.sharedWith).toBe("anybody");
});

test("changing sharing scope clears incompatible person filters", async () => {
  const { result } = renderHook(() => useWorkflowListQuery(), { wrapper });

  act(() => result.current.setSharingScope("shared-with-you"));
  act(() => result.current.setSharedByUser("alice@example.org"));
  await waitFor(() => {
    expect(result.current.query.sharedByUser).toBe("alice@example.org");
  });

  act(() => result.current.setSharingScope("shared-with-others"));

  await waitFor(() => {
    expect(result.current.query.sharingScope).toBe("shared-with-others");
    expect(result.current.query.sharedByUser).toBeUndefined();
    expect(result.current.query.sharedWithUser).toBe("anybody");
  });
});

test("normalizes a legacy view while preserving unrelated filters", async () => {
  const { result } = renderHook(() => useWorkflowListQuery(), {
    wrapper: wrapperWithEntry(
      "/?category=i-shared&page=3&status=running&search=analysis",
    ),
  });

  await waitFor(() => {
    expect(result.current.query.sharingScope).toBe("shared-with-others");
  });
  expect(result.current.query).toMatchObject({
    page: 3,
    search: "analysis",
    status: "running",
    sharedWithUser: "anybody",
  });
});
