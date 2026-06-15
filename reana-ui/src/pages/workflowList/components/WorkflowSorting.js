/*
  -*- coding: utf-8 -*-

  This file is part of REANA.
  Copyright (C) 2020, 2022, 2026 CERN.

  REANA is free software; you can redistribute it and/or modify it
  under the terms of the MIT License; see LICENSE file for more details.
*/

import PropTypes from "prop-types";
import { Dropdown } from "semantic-ui-react";

import styles from "./WorkflowSorting.module.scss";

const sortOptions = [
  { key: 1, text: "Latest first", value: "desc", icon: "sort amount down" },
  { key: 2, text: "Oldest first", value: "asc", icon: "sort amount up" },
  { key: 3, text: "Highest disk usage", value: "disk-desc", icon: "hdd" },
  { key: 4, text: "Highest CPU usage", value: "cpu-desc", icon: "microchip" },
];

export default function WorkflowSorting({ value, sort }) {
  const selected = sortOptions.find((option) => option.value === value);

  return (
    <div className={styles.sorting}>
      <span className={styles.label}>Sort by</span>
      <Dropdown
        inline
        options={sortOptions}
        text={selected?.text}
        onChange={(_, data) => sort(data.value)}
        value={value}
        aria-label="Sort workflows"
        className={styles.dropdown}
      />
    </div>
  );
}

WorkflowSorting.propTypes = {
  value: PropTypes.string.isRequired,
  sort: PropTypes.func.isRequired,
};
