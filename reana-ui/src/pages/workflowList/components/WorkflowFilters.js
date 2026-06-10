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
import { Dropdown } from "semantic-ui-react";

import { fetchUsersSharedWithYou, fetchUsersYouSharedWith } from "~/actions";
import { getUsersSharedWithYou, getUsersYouSharedWith } from "~/selectors";
import WorkflowRefinementMenu from "./WorkflowRefinementMenu";
import WorkflowStatusFilter from "./WorkflowStatusFilter";
import styles from "./WorkflowFilters.module.scss";

const SHARING_OPTIONS = [
  { value: "all", label: "All workflows", icon: "list" },
  { value: "not-shared", label: "Not shared", icon: "lock" },
  {
    value: "shared-with-others",
    label: "Shared with others",
    icon: "share alternate",
  },
  { value: "shared-with-you", label: "Shared with you", icon: "eye" },
];

const SESSION_OPTIONS = [
  { value: "all", label: "All workflows", icon: "list" },
  { value: "open", label: "Open sessions only", icon: "desktop" },
];

const DELETED_OPTIONS = [
  { value: "hidden", label: "Hide deleted runs", icon: "eye slash" },
  { value: "included", label: "Include deleted runs", icon: "eye" },
];

export default function WorkflowFilters({
  sharingScope,
  setSharingScope,
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
    if (sharingScope === "shared-with-you") {
      dispatch(fetchUsersSharedWithYou());
    } else if (sharingScope === "shared-with-others") {
      dispatch(fetchUsersYouSharedWith());
    }
  }, [dispatch, sharingScope]);

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
        <h3 className={styles.sectionTitle}>Sharing</h3>
        <WorkflowRefinementMenu
          ariaLabel="Filter workflows by sharing"
          options={SHARING_OPTIONS}
          value={sharingScope}
          onChange={setSharingScope}
        />
        {sharingScope === "shared-with-others" && (
          <div className={styles.contextualDropdown}>
            <label className={styles.dropdownLabel}>Shared with</label>
            <Dropdown
              fluid
              selection
              compact
              search
              scrolling
              options={sharedWithUserOptions}
              value={sharedWithUser || "anybody"}
              onChange={(_, { value }) => setSharedWithUser(value)}
              className={styles.personDropdown}
              aria-label="Filter by person the workflow was shared with"
            />
          </div>
        )}
        {sharingScope === "shared-with-you" && (
          <div className={styles.contextualDropdown}>
            <label className={styles.dropdownLabel}>Shared by</label>
            <Dropdown
              fluid
              selection
              compact
              search
              scrolling
              options={sharedByUserOptions}
              value={sharedByUser || "anybody"}
              onChange={(_, { value }) => setSharedByUser(value)}
              className={styles.personDropdown}
              aria-label="Filter by person who shared the workflow"
            />
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Sessions</h3>
        <WorkflowRefinementMenu
          ariaLabel="Filter by session availability"
          options={SESSION_OPTIONS}
          value={showOpenSessionsOnly ? "open" : "all"}
          onChange={(value) => setShowOpenSessionsOnly(value === "open")}
        />
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Deleted runs</h3>
        <WorkflowRefinementMenu
          ariaLabel="Choose deleted run visibility"
          options={DELETED_OPTIONS}
          value={includeDeleted ? "included" : "hidden"}
          onChange={(value) => setIncludeDeleted(value === "included")}
        />
      </section>
    </aside>
  );
}

WorkflowFilters.propTypes = {
  sharingScope: PropTypes.oneOf([
    "all",
    "not-shared",
    "shared-with-others",
    "shared-with-you",
  ]).isRequired,
  setSharingScope: PropTypes.func.isRequired,
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
