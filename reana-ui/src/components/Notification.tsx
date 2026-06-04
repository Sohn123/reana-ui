/*
  -*- coding: utf-8 -*-

  This file is part of REANA.
  Copyright (C) 2020, 2022 CERN.

  REANA is free software; you can redistribute it and/or modify it
  under the terms of the MIT License; see LICENSE file for more details.
*/

import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Message, Transition } from "semantic-ui-react";

import { clearNotification } from "~/actions";
import { getNotification } from "~/selectors";

import styles from "./Notification.module.scss";

const AUTO_CLOSE_TIMEOUT = 16000;

interface Props {
  icon?: string | null;
  header?: string | null;
  message?: string | React.ReactNode | null;
  closable?: boolean;
  error?: boolean;
  success?: boolean;
  warning?: boolean;
}

export default function Notification({
  icon = null,
  header = null,
  message = null,
  closable = true,
  error = false,
  success = false,
  warning = false,
}: Props) {
  const dispatch = useDispatch();
  const notification = useSelector(getNotification);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = () => dispatch(clearNotification);
  const visible = message || notification ? true : false;
  const actionIcon = notification?.isError
    ? "warning sign"
    : notification?.isWarning
      ? "warning circle"
      : "info circle";

  if (closable && visible) {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => hide(), AUTO_CLOSE_TIMEOUT);
  }
  return (
    <Transition visible={visible} duration={300}>
      <Container text className={styles.container}>
        <Message
          icon={icon || actionIcon}
          header={header || notification?.header}
          content={message || notification?.message}
          onDismiss={closable ? hide : null}
          size="small"
          error={error || (notification && notification.isError)}
          success={
            success ||
            (notification && !notification.isError && !notification.isWarning)
          }
          warning={
            warning ||
            (notification && notification.isWarning && !notification.isError)
          }
        />
      </Container>
    </Transition>
  );
}
