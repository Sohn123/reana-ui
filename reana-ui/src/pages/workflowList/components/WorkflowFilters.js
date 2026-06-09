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
import { Button, Dropdown, Icon } from "semantic-ui-react";

import { fetchUsersSharedWithYou, fetchUsersYouSharedWith } from "~/actions";
import { Search } from "~/components";
import { getUsersSharedWithYou, getUsersYouSharedWith } from "~/selectors";
import WorkflowStatusFilter from "./WorkflowStatusFilter";
import WorkflowSessionFilters from "./WorkflowSessionFilters";
import WorkflowSorting from "./WorkflowSorting";
import styles from "./WorkflowFilters.module.scss";

const categoryOptions = [
  { key: "all", text: "View: All workflows", value: "all" },
  { key: "mine", text: "View: Mine", value: "mine" },
  {
    key: "shared-with-me",
    text: "View: Shared with me",
    value: "shared-with-me",
  },
  { key: "i-shared", text: "View: I shared", value: "i-shared" },
];

export default function WorkflowFilters({
  searchText,
  setSearchText,
  submitSearch,
  category,
  setCategory,
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
  sortDir,
  setSortDir,
  workflowsCount,
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
      <div className={styles.primaryRow}>
        <div className={styles.viewControls}>
          <Dropdown
            selection
            compact
            options={categoryOptions}
            value={category}
            onChange={(_, { value }) => setCategory(value)}
            aria-label="Choose workflow view"
            className={styles.viewControl}
          />
          {category === "shared-with-me" && (
            <Dropdown
              compact
              selection
              search
              scrolling
              options={sharedByUserOptions}
              value={sharedByUser || "anybody"}
              onChange={(_, { value }) => setSharedByUser(value)}
              text={`From: ${sharedByUser || "anybody"}`}
              className={styles.personControl}
            />
          )}
          {category === "i-shared" && (
            <Dropdown
              compact
              selection
              search
              scrolling
              options={sharedWithUserOptions}
              value={sharedWithUser || "anybody"}
              onChange={(_, { value }) => setSharedWithUser(value)}
              text={`With: ${sharedWithUser || "anybody"}`}
              className={styles.personControl}
            />
          )}
        </div>
        <div className={styles.search}>
          <Search
            value={searchText}
            onChange={setSearchText}
            onSubmit={submitSearch}
            placeholder="Search by workflow name..."
          />
        </div>
      </div>
      <div className={styles.filterRow}>
        <span className={styles.refineLabel}>Refine</span>
        <WorkflowStatusFilter
          statusFilter={statusFilter}
          filter={setStatusFilter}
          hasStatusFilter={hasStatusFilter}
        />
        <WorkflowSessionFilters
          enabled={showOpenSessionsOnly}
          filter={setShowOpenSessionsOnly}
        />
        <Button
          basic
          compact
          active={includeDeleted}
          onClick={() => setIncludeDeleted(!includeDeleted)}
          aria-pressed={includeDeleted}
        >
          <Icon name="trash alternate outline" />
          Show deleted
        </Button>
        <div className={styles.resultControls}>
          <WorkflowSorting value={sortDir} sort={setSortDir} />
          <span className={styles.resultCount}>
            {workflowsCount} {workflowsCount === 1 ? "workflow" : "workflows"}
          </span>
        </div>
      </div>
    </div>
  );
}

WorkflowFilters.propTypes = {
  searchText: PropTypes.string.isRequired,
  setSearchText: PropTypes.func.isRequired,
  submitSearch: PropTypes.func.isRequired,
  category: PropTypes.oneOf(["all", "mine", "shared-with-me", "i-shared"])
    .isRequired,
  setCategory: PropTypes.func.isRequired,
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
  sortDir: PropTypes.string.isRequired,
  setSortDir: PropTypes.func.isRequired,
  workflowsCount: PropTypes.number.isRequired,
};
