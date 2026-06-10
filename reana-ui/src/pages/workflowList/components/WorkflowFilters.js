/*
  -*- coding: utf-8 -*-

  This file is part of REANA.
  Copyright (C) 2020, 2022, 2023, 2026 CERN.

  REANA is free software; you can redistribute it and/or modify it
  under the terms of the MIT License; see LICENSE file for more details.
*/

import _ from "lodash";
import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dropdown, Icon } from "semantic-ui-react";

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
  { value: "all", label: "All workflows", compactLabel: "All", icon: "list" },
  {
    value: "open",
    label: "Open sessions only",
    compactLabel: "Open only",
    icon: "desktop",
  },
];

const DELETED_OPTIONS = [
  {
    value: "hidden",
    label: "Hide deleted runs",
    compactLabel: "Hidden",
    icon: "eye slash",
  },
  {
    value: "included",
    label: "Include deleted runs",
    compactLabel: "Included",
    icon: "eye",
  },
];

function FilterSection({
  title,
  active = false,
  defaultOpen = true,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>
        <button
          type="button"
          className={styles.sectionToggle}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {title}
          {!open && active && <span className={styles.activeDot} />}
          <Icon name={open ? "chevron down" : "chevron right"} />
        </button>
      </h3>
      {open && <div className={styles.sectionContent}>{children}</div>}
    </section>
  );
}

FilterSection.propTypes = {
  title: PropTypes.string.isRequired,
  active: PropTypes.bool,
  defaultOpen: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

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
      <FilterSection title="Status" active={hasStatusFilter}>
        <WorkflowStatusFilter
          statusFilter={statusFilter}
          filter={setStatusFilter}
          hasStatusFilter={hasStatusFilter}
          fluid
        />
      </FilterSection>

      <FilterSection title="Sharing" active={sharingScope !== "all"}>
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
      </FilterSection>

      <FilterSection
        title="Display"
        active={showOpenSessionsOnly || includeDeleted}
        defaultOpen={showOpenSessionsOnly || includeDeleted}
      >
        <div className={styles.displayRow}>
          <span className={styles.displayLabel}>Sessions</span>
          <WorkflowRefinementMenu
            ariaLabel="Filter by session availability"
            horizontal
            options={SESSION_OPTIONS}
            value={showOpenSessionsOnly ? "open" : "all"}
            onChange={(value) => setShowOpenSessionsOnly(value === "open")}
          />
        </div>
        <div className={styles.displayRow}>
          <span className={styles.displayLabel}>Deleted runs</span>
          <WorkflowRefinementMenu
            ariaLabel="Choose deleted run visibility"
            horizontal
            options={DELETED_OPTIONS}
            value={includeDeleted ? "included" : "hidden"}
            onChange={(value) => setIncludeDeleted(value === "included")}
          />
        </div>
      </FilterSection>
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
