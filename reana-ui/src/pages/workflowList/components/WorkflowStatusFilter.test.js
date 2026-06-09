/*
  -*- coding: utf-8 -*-

  This file is part of REANA.
  Copyright (C) 2026 CERN.

  REANA is free software; you can redistribute it and/or modify it
  under the terms of the MIT License; see LICENSE file for more details.
*/

import { fireEvent, render, screen } from "@testing-library/react";

import WorkflowStatusFilter from "./WorkflowStatusFilter";

test("selects common statuses and reveals additional statuses", () => {
  const filter = jest.fn();

  render(
    <WorkflowStatusFilter
      statusFilter="running"
      filter={filter}
      hasStatusFilter
    />,
  );

  expect(screen.getByText("running").closest(".item")).toHaveClass("active");
  expect(screen.queryByText("created")).not.toBeInTheDocument();

  fireEvent.click(screen.getByText("More statuses"));
  fireEvent.click(screen.getByText("created"));
  fireEvent.click(screen.getByText("Any status"));

  expect(filter).toHaveBeenNthCalledWith(1, "created");
  expect(filter).toHaveBeenNthCalledWith(2, undefined);
});

test("reveals the active additional status by default", () => {
  render(
    <WorkflowStatusFilter
      statusFilter="pending"
      filter={jest.fn()}
      hasStatusFilter
    />,
  );

  expect(screen.getByText("pending").closest(".item")).toHaveClass("active");
  expect(screen.getByText("Fewer statuses")).toBeVisible();
});
