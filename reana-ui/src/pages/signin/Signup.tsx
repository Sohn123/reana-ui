/*
  -*- coding: utf-8 -*-

  This file is part of REANA.
  Copyright (C) 2020, 2022 CERN.

  REANA is free software; you can redistribute it and/or modify it
  under the terms of the MIT License; see LICENSE file for more details.
*/

import React, { useState } from "react";
import { Segment } from "semantic-ui-react";
import { Link } from "react-router-dom";

import SignForm from "./components/SignForm";
import SignContainer from "./components/SignContainer";
import { useGetConfig } from "~/api/hooks";
import { userSignup } from "../../actions";
import { useSubmit, useDocumentTitle } from "../../hooks";

export default function Signup() {
  useDocumentTitle("Sign up");
  const handleSubmit = useSubmit(userSignup);
  const config = useGetConfig().data ?? ({} as any);
  const [formData, setFormData] = useState<{ email: string; password: string }>(
    { email: "", password: "" },
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    setFormData({ ...formData, [target.name]: target.value });
  };

  return (
    <SignContainer>
      <Segment>
        {config.localUsers && (
          <SignForm
            submitText="Sign up"
            handleSubmit={(e) => handleSubmit(e, formData, setFormData)}
            formData={formData}
            handleInputChange={handleInputChange}
          />
        )}
      </Segment>
      {config.localUsers && (
        <p>
          Already signed up? Go to <Link to="/signin">Sign in</Link>
        </p>
      )}
    </SignContainer>
  );
}
