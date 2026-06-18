/*
  -*- coding: utf-8 -*-

  This file is part of REANA.
  Copyright (C) 2020, 2022, 2025 CERN.

  REANA is free software; you can redistribute it and/or modify it
  under the terms of the MIT License; see LICENSE file for more details.
*/

import { useState } from "react";
import { useSelector } from "react-redux";
import { Button, Segment } from "semantic-ui-react";
import { Link, useLocation } from "react-router-dom";

import { getConfig } from "~/selectors";
import SignForm from "./components/SignForm";
import SignContainer from "./components/SignContainer";
import { api } from "~/config";
import { userSignin } from "~/actions";
import { useSubmit, useDocumentTitle } from "~/hooks";

export default function Signin() {
  useDocumentTitle("Sign in");
  const handleSubmit = useSubmit(userSignin);
  const config = useSelector(getConfig);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const location = useLocation();
  const bffAuth = config.auth ?? {};
  const bffEnabled = Boolean(bffAuth.bff_enabled);
  const showLocalLogin = config.localUsers && !bffEnabled;

  const getNext = () => {
    const from = location.state?.from || {
      pathname: "/",
      search: "",
      hash: "",
    };
    return `${from.pathname}${from.search}${from.hash}`;
  };

  const handleBffClick = () => {
    const query = new URLSearchParams({ next: getNext() });
    window.location.href = `${api}${
      bffAuth.login_url ?? "/api/login"
    }?${query.toString()}`;
  };

  const handleInputChange = (event) => {
    const { target } = event;
    setFormData({ ...formData, [target.name]: target.value });
  };

  return (
    <SignContainer>
      <Segment>
        {bffEnabled && (
          <Button
            basic
            style={{ marginBottom: "5px" }}
            fluid
            size="large"
            onClick={handleBffClick}
          >
            Sign in with identity provider
          </Button>
        )}
        {showLocalLogin && (
          <SignForm
            submitText="Sign in"
            handleSubmit={(e) => handleSubmit(e, formData, setFormData)}
            formData={formData}
            handleInputChange={handleInputChange}
          />
        )}
      </Segment>
      {config.hideSignup && showLocalLogin && (
        <p>
          If you do not have an account yet, please contact
          <a href={`mailto:${config.adminEmail}`}> REANA administrators</a>
        </p>
      )}
      {!config.hideSignup && showLocalLogin && (
        <p>
          If you do not have an account yet, please
          <Link to="/signup"> Sign up</Link> here
        </p>
      )}
    </SignContainer>
  );
}
