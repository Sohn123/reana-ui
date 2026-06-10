/*
  -*- coding: utf-8 -*-

  This file is part of REANA.
  Copyright (C) 2026 CERN.

  REANA is free software; you can redistribute it and/or modify it
  under the terms of the MIT License; see LICENSE file for more details.
*/

import { fireEvent, render, screen } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";

import { getUsersSharedWithYou, getUsersYouSharedWith } from "~/selectors";
import WorkflowFilters from "./WorkflowFilters";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

const defaultProps = {
  category: "mine",
  statusFilter: undefined,
  setStatusFilter: jest.fn(),
  includeDeleted: false,
  setIncludeDeleted: jest.fn(),
  hasStatusFilter: false,
  sharedByUser: undefined,
  setSharedByUser: jest.fn(),
  sharedWithUser: undefined,
  setSharedWithUser: jest.fn(),
  showOpenSessionsOnly: false,
  setShowOpenSessionsOnly: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  useDispatch.mockReturnValue(jest.fn());
  useSelector.mockImplementation((selector) => {
    if (selector === getUsersSharedWithYou) return [];
    if (selector === getUsersYouSharedWith) {
      return [{ email: "alice@example.org" }];
    }
    return undefined;
  });
});

test("shows outgoing sharing refinements only for your workflows", () => {
  render(<WorkflowFilters {...defaultProps} />);

  expect(
    screen.getByLabelText("Filter your workflows by sharing"),
  ).toBeVisible();
  expect(
    screen.queryByLabelText("Filter by person the workflow was shared with"),
  ).not.toBeInTheDocument();

  fireEvent.click(screen.getByText("Shared with others"));

  expect(defaultProps.setSharedWithUser).toHaveBeenCalledWith("anybody");
});

test("shows the recipient selector for workflows shared with others", () => {
  render(<WorkflowFilters {...defaultProps} sharedWithUser="anybody" />);

  expect(
    screen.getByLabelText("Filter by person the workflow was shared with"),
  ).toBeVisible();
});

test("shows the owner selector only for workflows shared with you", () => {
  render(<WorkflowFilters {...defaultProps} category="shared-with-me" />);

  expect(
    screen.getByLabelText("Filter by person who shared the workflow"),
  ).toBeVisible();
  expect(
    screen.queryByLabelText("Filter your workflows by sharing"),
  ).not.toBeInTheDocument();
});
