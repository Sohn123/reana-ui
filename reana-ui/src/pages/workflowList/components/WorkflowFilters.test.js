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
  ownedBy: undefined,
  sharedWith: undefined,
  setSharing: jest.fn(),
  statusFilter: undefined,
  setStatusFilter: jest.fn(),
  includeDeleted: false,
  setIncludeDeleted: jest.fn(),
  hasStatusFilter: false,
  showOpenSessionsOnly: false,
  setShowOpenSessionsOnly: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  useDispatch.mockReturnValue(jest.fn());
  useSelector.mockImplementation((selector) => {
    if (selector === getUsersSharedWithYou) {
      return [{ email: "bob@example.org" }];
    }
    if (selector === getUsersYouSharedWith) {
      return [{ email: "alice@example.org" }];
    }
    return undefined;
  });
});

test("shows owned-workflow sharing choices and uses vertical display buttons", () => {
  render(<WorkflowFilters {...defaultProps} />);

  expect(
    screen.getByLabelText("Filter your workflows by sharing"),
  ).toBeVisible();
  expect(screen.getByText("Private")).toBeVisible();
  fireEvent.click(screen.getByText("Display"));
  expect(screen.getByLabelText("Filter by session availability")).toHaveClass(
    "vertical",
  );
  expect(screen.getByLabelText("Choose deleted run visibility")).toHaveClass(
    "vertical",
  );

  fireEvent.click(screen.getByText("Shared"));

  expect(defaultProps.setSharing).toHaveBeenCalledWith(undefined, "anybody");
});

test("selects private owned workflows without showing the recipient selector", () => {
  render(<WorkflowFilters {...defaultProps} />);

  fireEvent.click(screen.getByText("Private"));

  expect(defaultProps.setSharing).toHaveBeenCalledWith(undefined, "nobody");
  expect(
    screen.queryByLabelText("Filter by person the workflow was shared with"),
  ).not.toBeInTheDocument();
});

test("shows the recipient selector for owned workflows shared with others", () => {
  render(<WorkflowFilters {...defaultProps} sharedWith="anybody" />);

  expect(
    screen.getByLabelText("Filter by person the workflow was shared with"),
  ).toBeVisible();
  expect(
    screen.queryByLabelText("Filter by person who shared the workflow"),
  ).not.toBeInTheDocument();
});

test("shows only the sharer selector in the shared-with-you tab", () => {
  render(
    <WorkflowFilters
      {...defaultProps}
      category="shared-with-me"
      ownedBy="anybody"
    />,
  );

  expect(
    screen.getByLabelText("Filter by person who shared the workflow"),
  ).toBeVisible();
  expect(
    screen.queryByLabelText("Filter your workflows by sharing"),
  ).not.toBeInTheDocument();
});

test("allows an open user dropdown to overflow the scrolling sidebar", () => {
  render(
    <WorkflowFilters
      {...defaultProps}
      category="shared-with-me"
      ownedBy="anybody"
    />,
  );

  const sidebar = screen
    .getByLabelText("Filter by person who shared the workflow")
    .closest("aside");
  const dropdown = screen.getByLabelText(
    "Filter by person who shared the workflow",
  );

  expect(sidebar).not.toHaveClass("userDropdownOpen");

  fireEvent.click(dropdown);
  expect(sidebar).toHaveClass("userDropdownOpen");

  fireEvent.keyDown(dropdown, { key: "Escape" });
  expect(sidebar).not.toHaveClass("userDropdownOpen");
});
