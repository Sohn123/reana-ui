/*
  -*- coding: utf-8 -*-

  This file is part of REANA.
  Copyright (C) 2026 CERN.

  REANA is free software; you can redistribute it and/or modify it
  under the terms of the MIT License; see LICENSE file for more details.
*/

import PropTypes from "prop-types";
import { Button } from "semantic-ui-react";

import styles from "./WorkflowCategoryTabs.module.scss";

const CATEGORY_LABELS = {
  all: "All",
  mine: "Mine",
  "shared-with-me": "Shared with me",
  "i-shared": "I shared",
};

export default function WorkflowCategoryFilter({ category, setCategory }) {
  return (
    <Button.Group basic size="small" className={styles.categoryGroup}>
      {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
        <Button
          key={value}
          active={category === value}
          onClick={() => setCategory(value)}
        >
          {label}
        </Button>
      ))}
    </Button.Group>
  );
}

WorkflowCategoryFilter.propTypes = {
  category: PropTypes.oneOf(["all", "mine", "shared-with-me", "i-shared"])
    .isRequired,
  setCategory: PropTypes.func.isRequired,
};
