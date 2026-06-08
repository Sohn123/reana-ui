/*
  -*- coding: utf-8 -*-

  This file is part of REANA.
  Copyright (C) 2020, 2022, 2023, 2026 CERN.

  REANA is free software; you can redistribute it and/or modify it
  under the terms of the MIT License; see LICENSE file for more details.
*/

import PropTypes from "prop-types";
import { Grid } from "semantic-ui-react";

import WorkflowStatusFilter from "./WorkflowStatusFilter";
import WorkflowSorting from "./WorkflowSorting";
import styles from "./WorkflowFilters.module.scss";
import WorkflowSharingFilters from "./WorkflowSharingFilter";
import WorkflowSessionFilters from "./WorkflowSessionFilters";

export default function WorkflowFilters({
  ownedBy,
  sharedWith,
  setSharing,
  statusFilter,
  setStatusFilter,
  includeDeleted,
  setIncludeDeleted,
  hasStatusFilter,
  sortDir,
  setSortDir,
  showOpenSessionsOnly,
  setShowOpenSessionsOnly,
}) {
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
          ownedBy={ownedBy}
          sharedWith={sharedWith}
          setSharing={setSharing}
        />
        <Grid.Column mobile={16} tablet={4} computer={3} floated="right">
          <WorkflowSorting value={sortDir} sort={setSortDir} />
        </Grid.Column>
      </Grid>
    </div>
  );
}

WorkflowFilters.propTypes = {
  ownedBy: PropTypes.string,
  sharedWith: PropTypes.string,
  setSharing: PropTypes.func.isRequired,
  statusFilter: PropTypes.string,
  setStatusFilter: PropTypes.func.isRequired,
  includeDeleted: PropTypes.bool.isRequired,
  setIncludeDeleted: PropTypes.func.isRequired,
  hasStatusFilter: PropTypes.bool.isRequired,
  sortDir: PropTypes.string.isRequired,
  setSortDir: PropTypes.func.isRequired,
  showOpenSessionsOnly: PropTypes.bool.isRequired,
  setShowOpenSessionsOnly: PropTypes.func.isRequired,
};
