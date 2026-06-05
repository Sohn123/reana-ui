/*
  -*- coding: utf-8 -*-

  This file is part of REANA.
  Copyright (C) 2020, 2022, 2025 CERN.

  REANA is free software; you can redistribute it and/or modify it
  under the terms of the MIT License; see LICENSE file for more details.
*/

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetConfig } from "~/api/hooks";
import { Button, Divider, Segment } from "semantic-ui-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import SignForm from "./components/SignForm";
import SignContainer from "./components/SignContainer";
import client, { USER_OAUTH_SIGNIN_URL } from "~/client";
import { useNotification } from "~/NotificationContext";
import { useDocumentTitle } from "~/hooks";

export default function Signin() {
  useDocumentTitle("Sign in");
  const { notify } = useNotification();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const config = useGetConfig().data ?? ({} as any);
  const [formData, setFormData] = useState<{ email: string; password: string }>(
    { email: "", password: "" },
  );
  const [signErrors, setSignErrors] = useState<
    Array<{ field: string; message: string }>
  >([]);

  const tokenIssuancePolicyRaw: string = String(
    config.accessTokenIssuancePolicy ?? "manual",
  )
    .trim()
    .toLowerCase();
  const tokenIssuancePolicy: "auto" | "manual" =
    tokenIssuancePolicyRaw === "auto" || tokenIssuancePolicyRaw === "manual"
      ? tokenIssuancePolicyRaw
      : "manual";
  const shouldNotifyEmailConfirmation =
    config.userConfirmation && tokenIssuancePolicy !== "auto";

  const handleClick = (ssoProvider: string) => {
    const from = location.state?.from || {
      pathname: "/",
      search: "",
      hash: "",
    };
    const next = `${from.pathname}${from.search}${from.hash}`;
    window.location.href = USER_OAUTH_SIGNIN_URL(next, ssoProvider);
    // FIXME: We assume that the sign-up went successfully but we actually don't know.
    // We should upgrade Invenio-OAuthClient to latest version that supports REST apps
    // and adapt the whole workflow.
    if (shouldNotifyEmailConfirmation) {
      notify(
        "Success!",
        "User registered. Please confirm your email by clicking on the link we sent you.",
      );
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    setFormData({ ...formData, [target.name]: target.value });
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignErrors([]);
    try {
      await client.signIn(formData);
      queryClient.invalidateQueries({ queryKey: ["/api/you"] });
      const from = (location.state as any)?.from || { pathname: "/" };
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err?.response?.data?.errors) {
        setSignErrors(err.response.data.errors);
      } else {
        setSignErrors([
          {
            field: "email",
            message: err?.response?.data?.message || "Sign-in failed",
          },
        ]);
      }
      setFormData({ ...formData, password: "" });
    }
  };

  return (
    <SignContainer>
      <Segment>
        {config.cernSSO && (
          <>
            <Button
              basic
              style={{ marginBottom: "5px" }}
              fluid
              size="large"
              onClick={() => handleClick("cern_openid")}
            >
              Sign in with CERN Single Sign-On
            </Button>
          </>
        )}
        {config.eoscSSO && (
          <>
            <Button
              basic
              style={{ marginBottom: "5px" }}
              fluid
              size="large"
              onClick={() => handleClick("eosc_aai")}
            >
              Sign in with EOSC EU Node AAI
            </Button>
          </>
        )}
        {config.loginProviderConfig.length > 0 && (
          <>
            <Button
              basic
              style={{ marginBottom: "5px" }}
              fluid
              size="large"
              onClick={() => handleClick("keycloak")}
            >
              Sign in with {config.loginProviderConfig[0]["config"]["title"]}{" "}
              Single Sign-On
            </Button>
          </>
        )}
        {(config.loginProviderConfig.length > 0 ||
          config.cernSSO ||
          config.eoscSSO) &&
          config.localUsers && (
            <Divider section horizontal>
              or
            </Divider>
          )}
        {config.localUsers && (
          <SignForm
            submitText="Sign in"
            handleSubmit={handleSignin}
            formData={formData}
            handleInputChange={handleInputChange}
            errors={signErrors}
          />
        )}
      </Segment>
      {config.hideSignup && !config.localUsers && config.cernSSO && (
        <p>
          Note that you need to hold an official CERN account in order to use
          this service.
        </p>
      )}
      {config.hideSignup && config.localUsers && (
        <p>
          If you do not have an account yet, please contact
          <a href={`mailto:${config.adminEmail}`}> REANA administrators</a>
        </p>
      )}
      {!config.hideSignup && config.localUsers && (
        <p>
          If you do not have an account yet, please
          <Link to="/signup"> Sign up</Link> here
        </p>
      )}
    </SignContainer>
  );
}
