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

test("keeps anybody as the shared-with-others refinement", async () => {
  const { result } = renderHook(() => useWorkflowListQuery(), { wrapper });

  act(() => result.current.setSharedWithUser("anybody"));

  await waitFor(() => {
    expect(result.current.query.sharedWithUser).toBe("anybody");
  });
  expect(result.current.requestParams.sharedWith).toBe("anybody");
});

test("clears the owned workflow sharing refinement", async () => {
  const { result } = renderHook(() => useWorkflowListQuery(), { wrapper });

  act(() => result.current.setSharedWithUser("nobody"));
  await waitFor(() => {
    expect(result.current.query.sharedWithUser).toBe("nobody");
  });

  act(() => result.current.setSharedWithUser(undefined));

  await waitFor(() => {
    expect(result.current.query.sharedWithUser).toBeUndefined();
  });
  expect(result.current.requestParams.sharedWith).toBeUndefined();
});
