/*
  -*- coding: utf-8 -*-

  This file is part of REANA.
  Copyright (C) 2026 CERN.

  REANA is free software; you can redistribute it and/or modify it
  under the terms of the MIT License; see LICENSE file for more details.
*/

import PropTypes from "prop-types";
import { Menu } from "semantic-ui-react";

import styles from "./WorkflowCategoryTabs.module.scss";

const CATEGORY_LABELS = {
  all: "All workflows",
  mine: "Mine",
  "shared-with-me": "Shared with me",
  "i-shared": "Shared by me",
};

export default function WorkflowCategoryTabs({ category, setCategory }) {
  return (
    <nav className={styles.navigation} aria-label="Workflow views">
      <Menu secondary pointing className={styles.categoryMenu}>
        {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
          <Menu.Item
            key={value}
            name={value}
            content={label}
            active={category === value}
            onClick={() => setCategory(value)}
          />
        ))}
      </Menu>
    </nav>
  );
}

WorkflowCategoryTabs.propTypes = {
  category: PropTypes.oneOf(["all", "mine", "shared-with-me", "i-shared"])
    .isRequired,
  setCategory: PropTypes.func.isRequired,
};
