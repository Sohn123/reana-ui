/*
  -*- coding: utf-8 -*-

  This file is part of REANA.
  Copyright (C) 2026 CERN.

  REANA is free software; you can redistribute it and/or modify it
  under the terms of the MIT License; see LICENSE file for more details.
*/

import { fireEvent, render, screen } from "@testing-library/react";

import WorkflowCategoryTabs from "./WorkflowCategoryTabs";

test("renders workflow views and selects a different category", () => {
  const setCategory = jest.fn();

  render(
    <WorkflowCategoryTabs
      category="shared-with-me"
      setCategory={setCategory}
    />,
  );

  expect(
    screen.getByRole("navigation", { name: "Workflow views" }),
  ).toBeVisible();
  expect(screen.getByText("All workflows")).toBeVisible();
  expect(screen.getByText("Shared with me")).toHaveClass("active");
  expect(screen.getByText("Shared by me")).not.toHaveClass("active");

  fireEvent.click(screen.getByText("Shared by me"));

  expect(setCategory).toHaveBeenCalledWith("i-shared");
});
