/*
  -*- coding: utf-8 -*-

  This file is part of REANA.
  Copyright (C) 2020, 2021, 2022, 2023, 2024 CERN.

  REANA is free software; you can redistribute it and/or modify it
  under the terms of the MIT License; see LICENSE file for more details.
*/

import { Loader, Message, Divider } from "semantic-ui-react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

import {
  Box,
  WorkflowBadges,
  WorkflowInfo,
  WorkflowDeleteModal,
  WorkflowPruneModal,
  WorkflowShareModal,
  WorkflowStopModal,
  WorkflowActionsPopup,
  InteractiveSessionModal,
} from "~/components";

import styles from "./WorkflowList.module.scss";

function WorkflowListItem({ workflow }) {
  const cardClass = workflow.status === "deleted" ? styles.deleted : "";

  return (
    <Box className={cardClass} padding={false} flex={false}>
      <Link to={`/workflows/${workflow.id}`}>
        <div className={styles["workflow-details-container"]}>
          <WorkflowInfo workflow={workflow} actionsOnHover={true} />
        </div>
      </Link>
      <Divider className={styles.divider}></Divider>
      <div className={styles["badges-and-actions"]}>
        <WorkflowBadges workflow={workflow} />
        <WorkflowActionsPopup workflow={workflow} />
      </div>
    </Box>
  );
}

WorkflowListItem.propTypes = {
  workflow: PropTypes.object.isRequired,
};

export default function WorkflowList({ workflows, loading }) {
  if (loading && !workflows.length) {
    return (
      <div className={styles.listLoading}>
        <Loader active />
      </div>
    );
  }
  if (!workflows.length) {
    return <Message info icon="info circle" content="No workflows found." />;
  }
  return (
    <>
      <div className={styles.list}>
        <div className={loading ? styles.dimmed : undefined}>
          {workflows.map((workflow) => (
            <WorkflowListItem key={workflow.id} workflow={workflow} />
          ))}
        </div>
        {loading && <Loader active />}
      </div>
      <InteractiveSessionModal />
      <WorkflowDeleteModal />
      <WorkflowPruneModal />
      <WorkflowStopModal />
      <WorkflowShareModal />
    </>
  );
}

WorkflowList.propTypes = {
  workflows: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
};
