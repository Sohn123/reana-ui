/*
  -*- coding: utf-8 -*-

  This file is part of REANA.
  Copyright (C) 2026 CERN.

  REANA is free software; you can redistribute it and/or modify it
  under the terms of the MIT License; see LICENSE file for more details.
*/

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Checkbox, Icon, Message, Modal } from "semantic-ui-react";

import { pruneWorkspace } from "~/actions";
import { ParsedWorkflow } from "~/util";

interface Props {
  workflow: ParsedWorkflow;
  isOpen: boolean;
  onClose: () => void;
}

export default function WorkflowPruneModal({
  workflow,
  isOpen,
  onClose,
}: Props) {
  const dispatch = useDispatch<any>();
  const [includeInputs, setIncludeInputs] = useState<boolean>(false);
  const [includeOutputs, setIncludeOutputs] = useState<boolean>(false);

  const { id, name, run } = workflow;
  const size = workflow.size as { human_readable?: string } | undefined;

  useEffect(() => {
    // reset local state whenever the modal opens for a new workflow
    setIncludeInputs(false);
    setIncludeOutputs(false);
  }, [id, isOpen]);

  return (
    <Modal open={isOpen} onClose={onClose} closeIcon size="small">
      <Modal.Header>Prune workspace</Modal.Header>
      <Modal.Content>
        <Message icon warning>
          <Icon name="warning circle" />
          <Message.Content>
            This action will delete all workspace files produced by this run
            (and any restarts). Only the workflow inputs and outputs will be
            kept.
            {size?.human_readable
              ? ` Current workspace size: ${size.human_readable}.`
              : ""}
          </Message.Content>
        </Message>

        <Checkbox
          label={<label>Also delete workflow inputs</label>}
          onChange={(e: React.FormEvent, data: { checked?: boolean }) =>
            setIncludeInputs(data.checked ?? false)
          }
          checked={includeInputs}
        />
        <div style={{ height: "0.75rem" }} />
        <Checkbox
          label={<label>Also delete workflow outputs</label>}
          onChange={(e: React.FormEvent, data: { checked?: boolean }) =>
            setIncludeOutputs(data.checked ?? false)
          }
          checked={includeOutputs}
        />
      </Modal.Content>
      <Modal.Actions>
        <Button
          negative
          onClick={async () => {
            try {
              await dispatch(
                pruneWorkspace(id, { includeInputs, includeOutputs }),
              );
              onClose();
            } catch {
              // keep modal open on error; notification is handled upstream
            }
          }}
        >
          Prune "{name}#{run}"
        </Button>
        <Button onClick={onClose}>Cancel</Button>
      </Modal.Actions>
    </Modal>
  );
}
