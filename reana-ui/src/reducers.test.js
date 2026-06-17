/*
  This file is part of REANA.
  Copyright (C) 2026 CERN.

  REANA is free software; you can redistribute it and/or modify it
  under the terms of the MIT License; see LICENSE file for more details.
*/

import reanaApp from "~/reducers";
import { USER_FETCH, USER_FETCH_ERROR, USER_RECEIVED } from "~/actions";
import { USER_ERROR } from "~/errors";

function applyAuthAction(fullState, action) {
  return reanaApp(fullState, action);
}

test("a foreground (loader: true) fetch failure sets the blocking error", () => {
  const state = applyAuthAction(undefined, {
    type: USER_FETCH_ERROR,
    loader: true,
    status: 503,
    statusText: "Service Unavailable",
  });

  expect(state.auth.error).toEqual({
    [USER_ERROR.fetch]: { status: 503, statusText: "Service Unavailable" },
  });
});

test("a background (loader: false) fetch failure does not set the blocking error", () => {
  const state = applyAuthAction(undefined, {
    type: USER_FETCH_ERROR,
    loader: false,
    status: 503,
    statusText: "Service Unavailable",
  });

  expect(state.auth.error).toEqual({});
});

test("a background fetch discovering access_not_granted still surfaces it", () => {
  // A role revoked mid-session can be discovered by Profile's background
  // (loader: false) refresh just as easily as by the initial load -- the
  // dedicated AccessNotGranted screen must still take over either way, not
  // just when the loss of access happens to be caught on first load.
  const state = applyAuthAction(undefined, {
    type: USER_FETCH_ERROR,
    loader: false,
    status: 403,
    code: "access_not_granted",
    message: "User does not have the required role.",
  });

  expect(state.auth.error).toEqual({
    [USER_ERROR.fetch]: {
      status: 403,
      code: "access_not_granted",
      message: "User does not have the required role.",
    },
  });
});

test("a new fetch attempt clears a previously-set blocking error", () => {
  const errored = applyAuthAction(undefined, {
    type: USER_FETCH_ERROR,
    loader: true,
    status: 503,
    statusText: "Service Unavailable",
  });
  expect(errored.auth.error).not.toEqual({});

  const retried = applyAuthAction(errored, {
    type: USER_FETCH,
    loader: true,
  });

  expect(retried.auth.error).toEqual({});
});

test("a successful fetch clears a previously-set blocking error", () => {
  const errored = applyAuthAction(undefined, {
    type: USER_FETCH_ERROR,
    loader: true,
    status: 503,
    statusText: "Service Unavailable",
  });
  expect(errored.auth.error).not.toEqual({});

  const received = applyAuthAction(errored, {
    type: USER_RECEIVED,
    id: "user-1",
    email: "user@example.org",
  });

  expect(received.auth.error).toEqual({});
});
