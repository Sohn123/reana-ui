/*
  -*- coding: utf-8 -*-

  This file is part of REANA.
  Copyright (C) 2026 CERN.

  REANA is free software; you can redistribute it and/or modify it
  under the terms of the MIT License; see LICENSE file for more details.
*/

import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { Button, Icon, Popup } from "semantic-ui-react";
import copy from "copy-to-clipboard";

const COPY_CHECK_TIMEOUT = 1000;

export default function CopyButton({
  text,
  as: Trigger = Button,
  label,
  icon = "copy outline",
  timeout = COPY_CHECK_TIMEOUT,
  dismissOnScroll = false,
  ...props
}) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef();

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  useEffect(() => {
    if (!copied || !dismissOnScroll) return;
    const reset = () => setCopied(false);
    document.addEventListener("scroll", reset, { capture: true });
    return () =>
      document.removeEventListener("scroll", reset, { capture: true });
  }, [copied, dismissOnScroll]);

  const handleClick = async () => {
    const ok = await copy(text, { format: "text/plain" });
    if (!ok) return;
    setCopied(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), timeout);
  };
  const triggerProps =
    Trigger === Icon ? { name: icon } : { icon, content: label };

  return (
    <Popup
      inverted
      trigger={
        <Trigger
          {...triggerProps}
          {...props}
          aria-label={props["aria-label"] || "Copy to clipboard"}
          onClick={handleClick}
        />
      }
      open={copied}
      content="Copied to clipboard!"
    />
  );
}

CopyButton.propTypes = {
  text: PropTypes.string.isRequired,
  as: PropTypes.elementType,
  label: PropTypes.string,
  icon: PropTypes.string,
  timeout: PropTypes.number,
  dismissOnScroll: PropTypes.bool,
};
