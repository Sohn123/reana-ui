/*
  -*- coding: utf-8 -*-

  This file is part of REANA.
  Copyright (C) 2020, 2021, 2022, 2023, 2024 CERN.

  REANA is free software; you can redistribute it and/or modify it
  under the terms of the MIT License; see LICENSE file for more details.
*/

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Icon, Menu, Popup } from "semantic-ui-react";

import {
  closeInteractiveSession,
  deleteWorkflow,
  openDeleteWorkflowModal,
  openPruneWorkflowModal,
  openInteractiveSessionModal,
  openShareWorkflowModal,
  openStopWorkflowModal,
} from "~/actions";
import { getUserEmail } from "~/selectors";

import { JupyterNotebookIcon } from "~/components";

import styles from "./WorkflowActionsPopup.module.scss";
import { ParsedWorkflow } from "~/util";

interface Props {
  workflow: ParsedWorkflow;
  className?: string;
}

const JupyterIcon = <JupyterNotebookIcon className={styles["jupyter-icon"]} />;

export default function WorkflowActionsPopup({
  workflow,
  className = "",
}: Props) {
  const dispatch: any = useDispatch();
  const [open, setOpen] = useState(false);
  const userEmail: any = useSelector(getUserEmail);
  const { id, status } = workflow;
  const size = workflow.size as { raw: number } | undefined;
  const sessionStatus = workflow.session_status as string | undefined;
  const isDeleted = status === "deleted";
  const isDeletedUsingWorkspace =
    isDeleted && size !== undefined && size.raw > 0;
  const isRunning = status === "running";
  const isSessionOpen = sessionStatus === "running";

  let menuItems: any[] = [];

  if (!isDeleted && !isSessionOpen) {
    menuItems.push({
      key: "openNotebook",
      content: "Open Jupyter Notebook",
      icon: JupyterIcon,
      onClick: (e: React.MouseEvent) => {
        dispatch(openInteractiveSessionModal(workflow));
        setOpen(false);
      },
    });
  }

  menuItems.push({
    key: "share",
    content: "Share workflow",
    icon: "share alternate",
    onClick: (e: React.MouseEvent) => {
      dispatch(openShareWorkflowModal(workflow));
      setOpen(false);
    },
  });

  if (isSessionOpen) {
    menuItems.push({
      key: "closeNotebook",
      content: "Close Jupyter Notebook",
      icon: JupyterIcon,
      onClick: (e: React.MouseEvent) => {
        dispatch(closeInteractiveSession(id));
        setOpen(false);
      },
    });
  }

  if (isRunning) {
    menuItems.push({
      key: "stop",
      content: "Stop workflow",
      icon: "stop",
      onClick: (e: React.MouseEvent) => {
        dispatch(openStopWorkflowModal(workflow));
        setOpen(false);
      },
    });
  }

  if (!isDeleted && !isRunning) {
    menuItems.push({
      key: "prune",
      content: "Prune workspace",
      icon: "filter",
      onClick: (e: React.MouseEvent) => {
        dispatch(openPruneWorkflowModal(workflow));
        setOpen(false);
      },
    });
  }

  if (!isDeleted && !isRunning) {
    menuItems.push({
      key: "delete",
      content: "Delete workflow",
      icon: "trash",
      onClick: (e: React.MouseEvent) => {
        dispatch(openDeleteWorkflowModal(workflow));
        setOpen(false);
      },
    });
  }

  if (isDeletedUsingWorkspace) {
    menuItems.push({
      key: "freeup",
      content: "Free up disk",
      icon: "hdd",
      onClick: (e: React.MouseEvent) => {
        dispatch(deleteWorkflow(id));
        setOpen(false);
      },
    });
  }

  return (
    <div className={className}>
      {workflow.ownerEmail === userEmail && menuItems.length > 0 && (
        <Popup
          basic
          trigger={
            <Icon
              link
              name="ellipsis vertical"
              className={styles.icon}
              onClick={(e) => {
                setOpen(true);
              }}
            />
          }
          position="bottom left"
          on="click"
          open={open}
          onClose={() => setOpen(false)}
        >
          <Menu items={menuItems} secondary vertical />
        </Popup>
      )}
    </div>
  );
}
