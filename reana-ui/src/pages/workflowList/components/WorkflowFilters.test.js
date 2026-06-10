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
  sharingScope: "all",
  setSharingScope: jest.fn(),
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

test("shows status before the sharing scope choices", () => {
  render(<WorkflowFilters {...defaultProps} />);

  const headings = screen
    .getAllByRole("heading")
    .map(({ textContent }) => textContent);

  expect(headings.slice(0, 2)).toEqual(["Status", "Sharing"]);
  expect(screen.getByLabelText("Filter workflows by sharing")).toBeVisible();
  expect(
    screen.queryByLabelText("Filter by person the workflow was shared with"),
  ).not.toBeInTheDocument();

  fireEvent.click(screen.getByText("Shared with others"));

  expect(defaultProps.setSharingScope).toHaveBeenCalledWith(
    "shared-with-others",
  );
});

test("shows the recipient selector for workflows shared with others", () => {
  render(
    <WorkflowFilters
      {...defaultProps}
      sharingScope="shared-with-others"
      sharedWithUser="anybody"
    />,
  );

  expect(
    screen.getByLabelText("Filter by person the workflow was shared with"),
  ).toBeVisible();
  expect(
    screen.queryByLabelText("Filter by person who shared the workflow"),
  ).not.toBeInTheDocument();
});

test("shows the owner selector for workflows shared with you", () => {
  render(<WorkflowFilters {...defaultProps} sharingScope="shared-with-you" />);

  expect(
    screen.getByLabelText("Filter by person who shared the workflow"),
  ).toBeVisible();
  expect(
    screen.queryByLabelText("Filter by person the workflow was shared with"),
  ).not.toBeInTheDocument();
});
