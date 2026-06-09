/*
  -*- coding: utf-8 -*-

  This file is part of REANA.
  Copyright (C) 2020, 2022, 2023 CERN.

  REANA is free software; you can redistribute it and/or modify it
  under the terms of the MIT License; see LICENSE file for more details.
*/

import PropTypes from "prop-types";
import { Dropdown } from "semantic-ui-react";
import { WORKFLOW_STATUSES } from "~/config";
import { statusMapping } from "~/util";

// Not including deleted in the dropdown, toggle is the source of truth.
const statusOptions = WORKFLOW_STATUSES.filter((s) => s !== "deleted").map(
  (status) => ({
    key: status,
    text: status,
    value: status,
    icon: statusMapping[status].icon,
  }),
);

export default function WorkflowStatusFilters({
  statusFilter,
  filter,
  hasStatusFilter,
}) {
  const value = hasStatusFilter ? statusFilter : undefined;

  return (
    <Dropdown
      text={value ? `${value}` : "Any"}
      selection
      fluid
      compact
      clearable
      options={statusOptions}
      onChange={(_, { value: next }) => {
        const normalized = next || undefined;
        filter(normalized);
      }}
      value={value ?? null}
      aria-label="Filter by status"
    />
  );
}

WorkflowStatusFilters.propTypes = {
  statusFilter: PropTypes.string,
  filter: PropTypes.func.isRequired,
  hasStatusFilter: PropTypes.bool.isRequired,
};
