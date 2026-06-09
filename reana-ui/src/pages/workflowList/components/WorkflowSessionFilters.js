/*
  -*- coding: utf-8 -*-

  This file is part of REANA.
  Copyright (C) 2025 CERN.

  REANA is free software; you can redistribute it and/or modify it
  under the terms of the MIT License; see LICENSE file for more details.
*/

import PropTypes from "prop-types";
import { Button, Icon } from "semantic-ui-react";

export default function WorkflowSessionFilters({ enabled, filter }) {
  return (
    <Button
      basic
      compact
      active={enabled}
      onClick={() => filter(!enabled)}
      aria-pressed={enabled}
    >
      <Icon name="desktop" />
      Open sessions
    </Button>
  );
}

WorkflowSessionFilters.propTypes = {
  enabled: PropTypes.bool.isRequired,
  filter: PropTypes.func.isRequired,
};
