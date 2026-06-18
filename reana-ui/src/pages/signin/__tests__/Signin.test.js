/*
  This file is part of REANA.
  Copyright (C) 2026 CERN.

  REANA is free software; you can redistribute it and/or modify it
  under the terms of the MIT License; see LICENSE file for more details.
*/

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Signin from "../Signin";

const mockState = {
  config: {
    auth: { bff_enabled: true, login_url: "/api/login" },
    localUsers: true,
    hideSignup: false,
  },
};

jest.mock("react-redux", () => ({
  useDispatch: () => jest.fn(),
  useSelector: (selector) => selector(mockState),
}));

function renderSignin() {
  return render(
    <MemoryRouter>
      <Signin />
    </MemoryRouter>,
  );
}

test("renders one BFF identity-provider sign-in action", () => {
  renderSignin();

  expect(
    screen.getByRole("button", { name: "Sign in with identity provider" }),
  ).toBeInTheDocument();
  expect(screen.queryByText("Sign in with CERN Single Sign-On")).toBeNull();
  expect(screen.queryByText("Sign in with EOSC EU Node AAI")).toBeNull();
  expect(screen.queryByText(/Single Sign-On/)).toBeNull();
  expect(screen.queryByRole("button", { name: "Sign in" })).toBeNull();
});
