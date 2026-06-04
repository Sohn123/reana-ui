/*
  -*- coding: utf-8 -*-

  This file is part of REANA.
  Copyright (C) 2023 CERN.

  REANA is free software; you can redistribute it and/or modify it
  under the terms of the MIT License; see LICENSE file for more details.
*/

import _ from "lodash";
import PropTypes from "prop-types";
import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Dropdown, Grid } from "semantic-ui-react";
import { fetchUsersSharedWithYou, fetchUsersYouSharedWith } from "~/actions";
import { getUsersSharedWithYou, getUsersYouSharedWith } from "~/selectors";
import styles from "./WorkflowSharingFilter.module.scss";

const OWNED_BY = "owned_by";
const SHARED_WITH = "shared_with";

const sharingFilterOptions = [
  { key: 0, text: "Owned by", value: OWNED_BY },
  { key: 1, text: "Shared with", value: SHARED_WITH },
];

export default function WorkflowSharingFilters({
  ownedByFilter,
  setOwnedByFilter,
  sharedWithUser,
  viewingSharedWithMe,
  setSharedWithUser,
  setViewingSharedWithMe,
}) {
  const dispatch = useDispatch();

  const usersYouSharedWith = useSelector(getUsersYouSharedWith, _.isEqual);
  const usersSharedWithYou = useSelector(getUsersSharedWithYou, _.isEqual);

  const usersSharedWithYouOptions = useMemo(
    () => [
      { key: "you", text: "you", value: "you" },
      { key: "anybody", text: "anybody", value: "anybody" },
      ...usersSharedWithYou.map((user, index) => ({
        key: index,
        text: user.email,
        value: user.email,
      })),
    ],
    [usersSharedWithYou],
  );

  const usersYouSharedWithOptions = useMemo(
    () => [
      { key: "anybody", text: "anybody", value: "anybody" },
      ...usersYouSharedWith.map((user, index) => ({
        key: index,
        text: user.email,
        value: user.email,
      })),
    ],
    [usersYouSharedWith],
  );

  const selectedFilterOption = viewingSharedWithMe ? SHARED_WITH : OWNED_BY;
  const selectedUser = viewingSharedWithMe
    ? (sharedWithUser ?? "anybody")
    : (ownedByFilter ?? "you");

  useEffect(() => {
    dispatch(fetchUsersYouSharedWith());
    dispatch(fetchUsersSharedWithYou());
  }, [dispatch]);

  const handleSelectedFilterOptionChange = (_, { value }) => {
    if (value === OWNED_BY) {
      setOwnedByFilter("you");
      setViewingSharedWithMe(false);
    } else {
      setSharedWithUser("anybody");
      setViewingSharedWithMe(true);
    }
  };

  const handleSelectedUserChange = (_, { value }) => {
    if (selectedFilterOption === OWNED_BY) {
      setOwnedByFilter(value);
    } else {
      setSharedWithUser(value);
    }
  };

  return (
    <Grid.Column mobile={16} tablet={7} computer={4}>
      <div style={{ display: "flex" }}>
        <Dropdown
          fluid
          selection
          options={sharingFilterOptions}
          onChange={handleSelectedFilterOptionChange}
          value={selectedFilterOption}
          className={styles["sharing-filter-dropdown"]}
        />
        <Dropdown
          fluid
          selection
          search
          scrolling
          options={
            selectedFilterOption === OWNED_BY
              ? usersSharedWithYouOptions
              : usersYouSharedWithOptions
          }
          onChange={handleSelectedUserChange}
          value={selectedUser}
          className={styles["selected-user-dropdown"]}
        />
      </div>
    </Grid.Column>
  );
}

WorkflowSharingFilters.propTypes = {
  ownedByFilter: PropTypes.string,
  setOwnedByFilter: PropTypes.func.isRequired,
  sharedWithUser: PropTypes.string,
  viewingSharedWithMe: PropTypes.bool,
  setSharedWithUser: PropTypes.func.isRequired,
  setViewingSharedWithMe: PropTypes.func.isRequired,
};
