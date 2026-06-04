/*
  -*- coding: utf-8 -*-

  This file is part of REANA.
  Copyright (C) 2020 CERN.

  REANA is free software; you can redistribute it and/or modify it
  under the terms of the MIT License; see LICENSE file for more details.
*/

import React from "react";
import { useSelector } from "react-redux";
import { Button, Form, Input } from "semantic-ui-react";

import { getUserSignErrors } from "~/selectors";

import styles from "./SignForm.module.scss";

interface FormData {
  email: string;
  password: string;
}

interface Props {
  submitText: string;
  handleSubmit: (e: React.FormEvent) => void;
  formData: FormData;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SignForm({
  submitText,
  handleSubmit,
  formData,
  handleInputChange,
}: Props) {
  const errors = useSelector(getUserSignErrors);

  /**
   * Gets Form.Field compatible error prop per field/
   * @param {String} field Name of the field to get errors from
   */
  function getFieldErrors(
    field: string,
  ): false | { content: React.ReactNode; pointing: string } {
    const fieldErrors = errors?.filter((err) => err.field === field);
    return (
      !!fieldErrors?.length && {
        content: fieldErrors.map((err) => (
          <p key={err.message}>{err.message}</p>
        )),
        pointing: "above",
      }
    );
  }
  return (
    <Form onSubmit={handleSubmit} className={styles.form}>
      <Form.Field
        control={Input}
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        error={getFieldErrors("email")}
        required
      />
      <Form.Field
        control={Input}
        label="Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleInputChange}
        error={getFieldErrors("password")}
        required
      />
      <Button type="submit" primary fluid>
        {submitText}
      </Button>
    </Form>
  );
}
