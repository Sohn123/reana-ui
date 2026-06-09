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
import { Checkbox, Dropdown } from "semantic-ui-react";

import { fetchUsersSharedWithYou, fetchUsersYouSharedWith } from "~/actions";
import { getUsersSharedWithYou, getUsersYouSharedWith } from "~/selectors";
import WorkflowStatusFilter from "./WorkflowStatusFilter";
import styles from "./WorkflowFilters.module.scss";

export default function WorkflowFilters({
  category,
  statusFilter,
  setStatusFilter,
  includeDeleted,
  setIncludeDeleted,
  hasStatusFilter,
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
      {
        key: "anybody",
        text: "Anybody",
        value: "anybody",
        icon: "users",
      },
      ...usersSharedWithYou.map((user, _) => ({
        key: user.email,
        text: user.email,
        value: user.email,
        icon: "user outline",
      })),
    ],
    [usersSharedWithYou],
  );

  const sharedWithUserOptions = useMemo(
    () => [
      {
        key: "anybody",
        text: "Anybody",
        value: "anybody",
        icon: "users",
      },
      ...usersYouSharedWith.map((user, _) => ({
        key: user.email,
        text: user.email,
        value: user.email,
        icon: "user outline",
      })),
    ],
    [usersYouSharedWith],
  );

  return (
    <aside className={styles.sidebar}>
      {category === "shared-with-me" && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Shared by</h3>
          <Dropdown
            fluid
            selection
            search
            scrolling
            options={sharedByUserOptions}
            value={sharedByUser || "anybody"}
            onChange={(_, { value }) => setSharedByUser(value)}
            className={styles.personDropdown}
            aria-label="Filter by person who shared the workflow"
          />
        </section>
      )}

      {category === "i-shared" && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Shared with</h3>
          <Dropdown
            fluid
            selection
            search
            scrolling
            options={sharedWithUserOptions}
            value={sharedWithUser || "anybody"}
            onChange={(_, { value }) => setSharedWithUser(value)}
            className={styles.personDropdown}
            aria-label="Filter by person the workflow was shared with"
          />
        </section>
      )}

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Status</h3>
        <WorkflowStatusFilter
          statusFilter={statusFilter}
          filter={setStatusFilter}
          hasStatusFilter={hasStatusFilter}
          fluid
        />
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Options</h3>
        <div className={styles.options}>
          <Checkbox
            label="Open sessions only"
            checked={showOpenSessionsOnly}
            onChange={(_, { checked }) => setShowOpenSessionsOnly(!!checked)}
          />
          <Checkbox
            label="Show deleted runs"
            checked={includeDeleted}
            onChange={(_, { checked }) => setIncludeDeleted(!!checked)}
          />
        </div>
      </section>
    </aside>
  );
}

WorkflowFilters.propTypes = {
  category: PropTypes.oneOf(["all", "mine", "shared-with-me", "i-shared"])
    .isRequired,
  statusFilter: PropTypes.string,
  setStatusFilter: PropTypes.func.isRequired,
  includeDeleted: PropTypes.bool.isRequired,
  setIncludeDeleted: PropTypes.func.isRequired,
  hasStatusFilter: PropTypes.bool.isRequired,
  sharedByUser: PropTypes.string,
  setSharedByUser: PropTypes.func.isRequired,
  sharedWithUser: PropTypes.string,
  setSharedWithUser: PropTypes.func.isRequired,
  showOpenSessionsOnly: PropTypes.bool.isRequired,
  setShowOpenSessionsOnly: PropTypes.func.isRequired,
};
