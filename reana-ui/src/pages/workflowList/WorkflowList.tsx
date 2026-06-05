/*
  -*- coding: utf-8 -*-

  This file is part of REANA.
  Copyright (C) 2020, 2021, 2022, 2023 CERN.

  REANA is free software; you can redistribute it and/or modify it
  under the terms of the MIT License; see LICENSE file for more details.
*/

import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { Container, Dimmer, Dropdown, Icon, Loader } from "semantic-ui-react";

import {
  useGetWorkflows,
  WorkflowsParams,
  useGetConfig,
  useGetYou,
  useGetUsersSharedWithYou,
  getGetWorkflowsQueryKey,
} from "~/api/hooks";
import { getWorkflowRefresh } from "~/selectors";
import { parseWorkflows } from "~/util";
import { Title, Pagination, Search } from "~/components";
import BasePage from "../BasePage";
import Welcome from "./components/Welcome";
import WorkflowFilters from "./components/WorkflowFilters";
import WorkflowList from "./components/WorkflowList";
import { useWorkflowListQuery } from "./useWorkflowListQuery";
import { WORKFLOW_LIST_PAGE_SIZE_OPTIONS } from "./workflowListQuery";
import styles from "./WorkflowList.module.scss";

export default function WorkflowListPage() {
  return (
    <BasePage title="Your workflows">
      <Workflows />
    </BasePage>
  );
}

function Workflows() {
  const currentUTCTime = () => moment.utc().format("HH:mm:ss [UTC]");
  const [refreshedAt] = useState(currentUTCTime());
  const { data: configData } = useGetConfig();
  const { data: youData } = useGetYou();
  const { data: usersSharedWithYouData } = useGetUsersSharedWithYou();
  const pollingSecs = (configData as any)?.polling_secs ?? 0;
  const reanaToken = youData?.reana_token?.value;
  const usersSharedWithYou = usersSharedWithYouData?.users ?? [];
  const workflowRefresh = useSelector(getWorkflowRefresh) as any;
  const queryClient = useQueryClient();
  const {
    query,
    requestParams,
    searchText,
    setSearchText,
    submitSearch,
    setPage,
    setPageSize,
    setStatus,
    setIncludeDeleted,
    setSort,
    setShowOpenSessionsOnly,
    setCategory,
    setSharedByUser,
    setSharedWithUser,
  } = useWorkflowListQuery();
  const {
    page,
    pageSize,
    status,
    hasStatusFilter,
    includeDeleted,
    sort,
    showOpenSessionsOnly,
    category,
    sharedByUser,
    sharedWithUser,
  } = query;

  const workflowParams: WorkflowsParams = {
    verbose: true,
    page: requestParams.pagination.page,
    size: requestParams.pagination.size,
    search: requestParams.search,
    status: requestParams.status as any,
    shared: requestParams.shared,
    shared_by: requestParams.sharedBy,
    shared_with: requestParams.sharedWith,
    sort: requestParams.sort,
    ...(requestParams.type ? { type: requestParams.type } : {}),
  };

  const { data: workflowsData, isLoading: loading } = useGetWorkflows(
    workflowParams,
    {
      query: {
        refetchInterval: reanaToken && pollingSecs ? pollingSecs * 1000 : false,
      },
    },
  );

  const workflowArray = useMemo(
    () =>
      Object.values(
        parseWorkflows((workflowsData?.items ?? []) as any[]),
      ) as import("~/util").ParsedWorkflow[],
    [workflowsData],
  );

  const workflowsCount = workflowsData?.total ?? 0;
  const hasUserWorkflows = workflowsCount > 0;
  const hideWelcomePage = loading || workflowsCount > 0;

  // External refresh trigger
  useEffect(() => {
    if (workflowRefresh === undefined) return;
    queryClient.invalidateQueries({ queryKey: getGetWorkflowsQueryKey() });
  }, [workflowRefresh, queryClient]);

  if (hideWelcomePage) {
    return (
      loading && (
        <Dimmer active inverted>
          <Loader>Loading workflows...</Loader>
        </Dimmer>
      )
    );
  }

  if (!hasUserWorkflows && usersSharedWithYou.length === 0) {
    return <Welcome />;
  }

  return (
    <div className={styles.container}>
      <Container text className={styles["workflow-list-container"]}>
        <Title className={styles.title}>
          <span>Your workflows</span>
          <span className={styles.refresh}>
            <Icon
              name="refresh"
              className={styles.icon}
              onClick={() => window.location.reload()}
            />
            Refreshed at {refreshedAt}
          </span>
        </Title>
        <Search
          value={searchText}
          onChange={setSearchText}
          onSubmit={submitSearch}
        />
        <WorkflowFilters
          category={category as any}
          setCategory={setCategory}
          statusFilter={status}
          setStatusFilter={setStatus}
          includeDeleted={includeDeleted}
          setIncludeDeleted={setIncludeDeleted}
          hasStatusFilter={hasStatusFilter}
          showOpenSessionsOnly={showOpenSessionsOnly}
          setShowOpenSessionsOnly={setShowOpenSessionsOnly}
          sharedByUser={sharedByUser}
          setSharedByUser={setSharedByUser}
          sharedWithUser={sharedWithUser}
          setSharedWithUser={setSharedWithUser}
          sortDir={sort}
          setSortDir={setSort}
        />
        <WorkflowList workflows={workflowArray} loading={loading} />
        {!loading && (
          <div className={styles.paginationRow}>
            {/* To emulate size of page-size dropdown and ensure page buttons stay in middle of screen */}
            <div className={styles.pageSizeNotVisible}>
              <span className={styles.pageSizeLabel}>Results per page:</span>
              <Dropdown
                selection
                compact
                options={WORKFLOW_LIST_PAGE_SIZE_OPTIONS}
                value={pageSize}
              />
            </div>
            {workflowsCount > pageSize && (
              <Pagination
                className={styles.pagination}
                activePage={page}
                totalPages={Math.ceil(workflowsCount / pageSize)}
                onPageChange={(_, { activePage }) =>
                  setPage(Number(activePage))
                }
              />
            )}
            <div className={styles.pageSize}>
              <span className={styles.pageSizeLabel}>Results per page:</span>
              <Dropdown
                selection
                compact
                options={
                  WORKFLOW_LIST_PAGE_SIZE_OPTIONS.some(
                    (o) => o.value === pageSize,
                  )
                    ? WORKFLOW_LIST_PAGE_SIZE_OPTIONS
                    : [
                        ...WORKFLOW_LIST_PAGE_SIZE_OPTIONS,
                        {
                          key: pageSize,
                          text: String(pageSize),
                          value: pageSize,
                        },
                      ].sort((a, b) => a.value - b.value)
                }
                value={pageSize}
                onChange={(_, { value }) => {
                  const newSize = Number(value);
                  setPageSize(newSize);
                }}
              />
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
