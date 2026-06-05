/*
	-*- coding: utf-8 -*-

	This file is part of REANA.
	Copyright (C) 2020 CERN.

  REANA is free software; you can redistribute it and/or modify it
  under the terms of the MIT License; see LICENSE file for more details.
*/

import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setOnUnauthorized } from "~/api/axiosInstance";
import App from "./components/App";
import { NotificationProvider } from "~/NotificationContext";

import "semantic-ui-css/semantic.min.css";

const queryClient = new QueryClient();

// On session expiry, clear all cached data and redirect to sign-in
setOnUnauthorized(() => {
  queryClient.clear();
  window.location.replace("/signin");
});

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <QueryClientProvider client={queryClient}>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </QueryClientProvider>,
);
