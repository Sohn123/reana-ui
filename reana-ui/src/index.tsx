/*
	-*- coding: utf-8 -*-

	This file is part of REANA.
	Copyright (C) 2020 CERN.

  REANA is free software; you can redistribute it and/or modify it
  under the terms of the MIT License; see LICENSE file for more details.
*/

import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import store from "./store";
import client from "~/client";
import { setOnUnauthorized } from "~/api/axiosInstance";
import { loadUser, loadConfig, USER_SIGNEDOUT } from "~/actions";
import App from "./components/App";

import "semantic-ui-css/semantic.min.css";

// Wire session-expiry handler for both the old Redux client (step 3)
// and the new Orval-generated hooks (step 4 onwards).
const handleUnauthorized = () => store.dispatch({ type: USER_SIGNEDOUT });
client.setOnUnauthorized(handleUnauthorized);
setOnUnauthorized(handleUnauthorized);

function fetchInitialData(store) {
  store.dispatch(loadUser());
  store.dispatch(loadConfig());
}

fetchInitialData(store);

const container = document.getElementById("root");
const root = createRoot(container);

const queryClient = new QueryClient();

root.render(
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <App />
    </Provider>
  </QueryClientProvider>,
);
