/*
  -*- coding: utf-8 -*-

  This file is part of REANA.
  Copyright (C) 2020, 2022, 2023, 2026 CERN.

  REANA is free software; you can redistribute it and/or modify it
  under the terms of the MIT License; see LICENSE file for more details.
*/

import _ from "lodash";
import PropTypes from "prop-types";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dropdown, Grid } from "semantic-ui-react";

import { fetchUsersSharedWithYou, fetchUsersYouSharedWith } from "~/actions";
import { getUsersSharedWithYou, getUsersYouSharedWith } from "~/selectors";
import WorkflowCategoryFilter from "./WorkflowCategoryTabs";
import WorkflowStatusFilter from "./WorkflowStatusFilter";
import WorkflowSessionFilters from "./WorkflowSessionFilters";
import WorkflowSorting from "./WorkflowSorting";
import styles from "./WorkflowFilters.module.scss";

export default function WorkflowFilters({
  category,
  setCategory,
  statusFilter,
  setStatusFilter,
  includeDeleted,
  setIncludeDeleted,
  hasStatusFilter,
  sortDir,
  setSortDir,
  sharedByUser,
  setSharedByUser,
  sharedWithUser,
  setSharedWithUser,
  showOpenSessionsOnly,
  setShowOpenSessionsOnly,
}) {
  const dispatch = useDispatch();
  const usersSharedWithYou = useSelector(getUsersSharedWithYou, _.isEqual);
  const usersYouSharedWith = useSelector(getUsersYouSharedWith, _.isEqual);

  useEffect(() => {
    if (category === "shared-with-me") {
      dispatch(fetchUsersSharedWithYou());
    } else if (category === "i-shared") {
      dispatch(fetchUsersYouSharedWith());
    }
  }, [dispatch, category]);

  const sharedByUserOptions = useMemo(
    () => [
      { key: "anybody", text: "anybody", value: "anybody" },
      ...usersSharedWithYou.map((user, _) => ({
        key: user.email,
        text: user.email,
        value: user.email,
      })),
    ],
    [usersSharedWithYou],
  );

  const sharedWithUserOptions = useMemo(
    () => [
      { key: "anybody", text: "anybody", value: "anybody" },
      ...usersYouSharedWith.map((user, _) => ({
        key: user.email,
        text: user.email,
        value: user.email,
      })),
    ],
    [usersYouSharedWith],
  );

  return (
    <div className={styles.container}>
      {/* Row 1: Category chips + inline contextual user filter */}
      <div className={styles.categoryRow}>
        <WorkflowCategoryFilter category={category} setCategory={setCategory} />
        {category === "shared-with-me" && (
          <div className={styles.contextualFilter}>
            <span className={styles.contextLabel}>by</span>
            <Dropdown
              compact
              selection
              search
              scrolling
              options={sharedByUserOptions}
              value={sharedByUser || "anybody"}
              onChange={(_, { value }) => setSharedByUser(value)}
            />
          </div>
        )}
        {category === "i-shared" && (
          <div className={styles.contextualFilter}>
            <span className={styles.contextLabel}>with</span>
            <Dropdown
              compact
              selection
              search
              scrolling
              options={sharedWithUserOptions}
              value={sharedWithUser || "anybody"}
              onChange={(_, { value }) => setSharedWithUser(value)}
            />
          </div>
        )}
      </div>

      {/* Row 2: Utility filters */}
      <Grid verticalAlign="middle">
        <WorkflowStatusFilter
          statusFilter={statusFilter}
          filter={setStatusFilter}
          includeDeleted={includeDeleted}
          setIncludeDeleted={setIncludeDeleted}
          hasStatusFilter={hasStatusFilter}
        />
        <WorkflowSessionFilters
          enabled={showOpenSessionsOnly}
          filter={setShowOpenSessionsOnly}
        />
        <Grid.Column mobile={16} tablet={4} computer={3} floated="right">
          <WorkflowSorting value={sortDir} sort={setSortDir} />
        </Grid.Column>
      </Grid>
    </div>
  );
}

WorkflowFilters.propTypes = {
  category: PropTypes.oneOf(["all", "mine", "shared-with-me", "i-shared"])
    .isRequired,
  setCategory: PropTypes.func.isRequired,
  statusFilter: PropTypes.string,
  setStatusFilter: PropTypes.func.isRequired,
  includeDeleted: PropTypes.bool.isRequired,
  setIncludeDeleted: PropTypes.func.isRequired,
  hasStatusFilter: PropTypes.bool.isRequired,
  sortDir: PropTypes.string.isRequired,
  setSortDir: PropTypes.func.isRequired,
  sharedByUser: PropTypes.string,
  setSharedByUser: PropTypes.func.isRequired,
  sharedWithUser: PropTypes.string,
  setSharedWithUser: PropTypes.func.isRequired,
  showOpenSessionsOnly: PropTypes.bool.isRequired,
  setShowOpenSessionsOnly: PropTypes.func.isRequired,
};
