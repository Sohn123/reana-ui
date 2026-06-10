/*
  -*- coding: utf-8 -*-

  This file is part of REANA.
  Copyright (C) 2026 CERN.

  REANA is free software; you can redistribute it and/or modify it
  under the terms of the MIT License; see LICENSE file for more details.
*/

import PropTypes from "prop-types";
import { Icon, Menu } from "semantic-ui-react";

import styles from "./WorkflowRefinementMenu.module.scss";

export default function WorkflowRefinementMenu({
  ariaLabel,
  horizontal = false,
  options,
  value,
  onChange,
}) {
  return (
    <Menu
      secondary
      vertical={!horizontal}
      fluid
      className={`${styles.refinementMenu} ${
        horizontal ? styles.horizontal : ""
      }`}
      aria-label={ariaLabel}
    >
      {options.map((option) => (
        <Menu.Item
          key={option.value}
          name={option.value}
          active={value === option.value}
          onClick={() => onChange(option.value)}
          aria-label={option.label}
          title={horizontal ? option.label : undefined}
        >
          <Icon name={option.icon} />
          <span>
            {horizontal ? option.compactLabel || option.label : option.label}
          </span>
        </Menu.Item>
      ))}
    </Menu>
  );
}

WorkflowRefinementMenu.propTypes = {
  ariaLabel: PropTypes.string.isRequired,
  horizontal: PropTypes.bool,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      compactLabel: PropTypes.string,
      value: PropTypes.string.isRequired,
    }),
  ).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
