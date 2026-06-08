/*
  -*- coding: utf-8 -*-

  This file is part of REANA.
  Copyright (C) 2020, 2022, 2023, 2026 CERN.

  REANA is free software; you can redistribute it and/or modify it
  under the terms of the MIT License; see LICENSE file for more details.
*/

import PropTypes from "prop-types";
import { useSearchParams } from "react-router-dom";
import { Grid } from "semantic-ui-react";

import WorkflowStatusFilter from "./WorkflowStatusFilter";
import WorkflowSorting from "./WorkflowSorting";
import styles from "./WorkflowFilters.module.scss";
import WorkflowSharingFilters from "./WorkflowSharingFilter";
import WorkflowSessionFilters from "./WorkflowSessionFilters";

export default function WorkflowFilters({
  category,
  statusFilter,
  setStatusFilter,
  includeDeleted,
  setIncludeDeleted,
  hasStatusFilter,
  sortDir,
  setSortDir,
  sharedByUser,
  sharedWithUser,
  setSharedWithUser,
  showOpenSessionsOnly,
  setShowOpenSessionsOnly,
}) {
  const [, setSearchParams] = useSearchParams();

  // Translate new category-based state to old WorkflowSharingFilters props
  const ownedByFilter = (() => {
    if (category === "shared-with-me") return sharedByUser || "anybody";
    if (category === "all") return "anybody";
    return "you"; // "mine" or "i-shared"
  })();
  const sharedWithMode = category === "i-shared";
  const sharedWithFilter =
    category === "i-shared" ? sharedWithUser || "anybody" : undefined;

  // Single atomic URL update — avoids the setCategory → clear shared-by race.
  // Called with undefined from WorkflowSharingFilter when in "Shared with" mode — skip in that case.
  const setOwnedByFilter = (value) => {
    if (value == null) return;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("page");
      next.delete("shared"); // legacy
      next.delete("shared-with"); // legacy
      if (value === "you") {
        next.set("category", "mine");
        next.delete("shared-by");
        next.delete("shared-with-user");
      } else if (value === "anybody") {
        next.delete("category"); // "all" is the default
        next.delete("shared-by");
        next.delete("shared-with-user");
      } else {
        // Specific user — shared-with-me category
        next.set("category", "shared-with-me");
        next.set("shared-by", value);
        next.delete("shared-with-user");
      }
      return next;
    });
  };

  const setSharedWithModeInUrl = (on) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("page");
      next.delete("shared");
      next.delete("shared-with");
      next.delete("shared-by");
      next.delete("shared-with-user");
      if (on) {
        next.set("category", "i-shared");
      } else {
        next.delete("category"); // "all" is the default
      }
      return next;
    });
  };

  const setSharedWithFilterForOld = (value) => {
    // When called with undefined (from the "Owned by" path), setOwnedByFilter
    // already cleared shared-with-user atomically — no second call needed.
    if (value == null) return;
    setSharedWithUser(value);
  };

  return (
    <div className={styles.container}>
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
        <WorkflowSharingFilters
          ownedByFilter={ownedByFilter}
          setOwnedByFilter={setOwnedByFilter}
          sharedWithFilter={sharedWithFilter}
          sharedWithMode={sharedWithMode}
          setSharedWithFilter={setSharedWithFilterForOld}
          setSharedWithModeInUrl={setSharedWithModeInUrl}
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
