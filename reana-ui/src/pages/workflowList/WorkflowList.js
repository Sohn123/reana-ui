/*
  -*- coding: utf-8 -*-

  This file is part of REANA.
  Copyright (C) 2020, 2021, 2022, 2023, 2024, 2025, 2026 CERN.

  REANA is free software; you can redistribute it and/or modify it
  under the terms of the MIT License; see LICENSE file for more details.
*/

import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Container,
  Dimmer,
  Dropdown,
  Icon,
  Loader,
} from "semantic-ui-react";

import { fetchUsersSharedWithYou, fetchWorkflows } from "~/actions";
import {
  getConfig,
  getReanaToken,
  getWorkflows,
  getWorkflowsCount,
  isConfigLoaded,
  loadingWorkflows,
  userHasWorkflows,
  getWorkflowRefresh,
  getUsersSharedWithYou,
} from "~/selectors";
import { Pagination, Search } from "~/components";
import BasePage from "../BasePage";
import Welcome from "./components/Welcome";
import WorkflowCategoryTabs from "./components/WorkflowCategoryTabs";
import WorkflowFilters from "./components/WorkflowFilters";
import WorkflowList from "./components/WorkflowList";
import WorkflowSorting from "./components/WorkflowSorting";
import { useWorkflowContinuationCue } from "./useWorkflowContinuationCue";
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
  const [refreshedAt, setRefreshedAt] = useState(currentUTCTime());
  const dispatch = useDispatch();
  const config = useSelector(getConfig);
  const workflows = useSelector(getWorkflows);
  const workflowsCount = useSelector(getWorkflowsCount);
  const hasUserWorkflows = useSelector(userHasWorkflows);
  const usersSharedWithYou = useSelector(getUsersSharedWithYou);
  const workflowRefresh = useSelector(getWorkflowRefresh);
  const loading = useSelector(loadingWorkflows);
  const reanaToken = useSelector(getReanaToken);
  const configLoaded = useSelector(isConfigLoaded);
  const hideWelcomePage = !workflows || !configLoaded;
  const { pollingSecs } = config;
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
    setSharing,
    clearFilters,
    hasActiveFilters,
  } = useWorkflowListQuery();
  const {
    page,
    pageSize,
    status,
    hasStatusFilter,
    includeDeleted,
    sort,
    showOpenSessionsOnly,
    ownedBy,
    sharedWith,
  } = query;
  const category = ownedBy ? "shared-with-me" : "mine";

  // Load information about users who have shared workflows with you
  useEffect(() => {
    dispatch(fetchUsersSharedWithYou());
  }, [dispatch]);

  const lastParamsRef = useRef();
  useEffect(() => {
    if (!configLoaded) return;
    if (lastParamsRef.current === requestParams) return;
    lastParamsRef.current = requestParams;
    dispatch(fetchWorkflows(requestParams));
  }, [dispatch, requestParams, configLoaded]);

  const latestParamsRef = useRef(requestParams);
  useEffect(() => {
    latestParamsRef.current = requestParams;
  }, [requestParams]);

  useEffect(() => {
    // Only poll if user has a token (no point polling for users without workflows)
    if (!reanaToken || !pollingSecs || !configLoaded) return;
    const id = setInterval(() => {
      const apiParams = latestParamsRef.current;
      dispatch(fetchWorkflows({ ...apiParams, showLoader: false }));
      setRefreshedAt(currentUTCTime());
    }, pollingSecs * 1000);
    return () => clearInterval(id);
  }, [dispatch, reanaToken, pollingSecs, configLoaded]);

  // External refresh trigger
  useEffect(() => {
    if (!configLoaded) return;
    if (workflowRefresh === undefined) return;
    const apiParams = latestParamsRef.current;
    dispatch(fetchWorkflows({ ...apiParams, showLoader: false }));
  }, [workflowRefresh, dispatch, configLoaded]);

  const { listEndRef, footerRef, showContinuationCue } =
    useWorkflowContinuationCue({
      workflows,
      workflowsCount,
      page,
      pageSize,
      loading,
    });

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

  // Flatten workflows object to array for rendering
  const workflowArray = Object.values(workflows || {});
  const pageSizeOptions = WORKFLOW_LIST_PAGE_SIZE_OPTIONS.some(
    (option) => option.value === pageSize,
  )
    ? WORKFLOW_LIST_PAGE_SIZE_OPTIONS
    : [
        ...WORKFLOW_LIST_PAGE_SIZE_OPTIONS,
        {
          key: pageSize,
          text: `${pageSize}`,
          value: pageSize,
        },
      ].sort((a, b) => a.value - b.value);
  const firstResult = workflowsCount > 0 ? (page - 1) * pageSize + 1 : 0;
  const lastResult =
    workflowsCount > 0 ? Math.min(page * pageSize, workflowsCount) : 0;
  const totalPages = Math.ceil(workflowsCount / pageSize);
  const showPagination = workflowsCount > pageSize;
  const hasVisibleWorkflows = workflowArray.length > 0;

  return (
    <div className={styles.container}>
      <Container text className={styles["workflow-list-container"]}>
        <WorkflowCategoryTabs
          category={category}
          setCategory={(nextCategory) =>
            setSharing(
              nextCategory === "shared-with-me" ? "anybody" : undefined,
              undefined,
            )
          }
          refreshedAt={refreshedAt}
          refresh={() => window.location.reload()}
        />
        <div className={styles.browser}>
          <WorkflowFilters
            category={category}
            ownedBy={ownedBy}
            sharedWith={sharedWith}
            setSharing={setSharing}
            statusFilter={status}
            setStatusFilter={setStatus}
            includeDeleted={includeDeleted}
            setIncludeDeleted={setIncludeDeleted}
            hasStatusFilter={hasStatusFilter}
            showOpenSessionsOnly={showOpenSessionsOnly}
            setShowOpenSessionsOnly={setShowOpenSessionsOnly}
          />
          <main className={styles.results}>
            <div className={styles.resultsHeader}>
              <div className={styles.search}>
                <Search
                  value={searchText}
                  onChange={setSearchText}
                  onSubmit={submitSearch}
                  placeholder="Search by workflow name..."
                />
              </div>
              <div className={styles.resultControls}>
                <WorkflowSorting value={sort} sort={setSort} />
                {hasActiveFilters && (
                  <Button
                    compact
                    className={styles.clearFilters}
                    onClick={clearFilters}
                  >
                    <Icon name="remove filter" />
                    Clear filters
                  </Button>
                )}
              </div>
            </div>
            {workflowsCount > 0 && (
              <div className={styles.resultContext}>
                Showing {firstResult}–{lastResult} of {workflowsCount}{" "}
                {workflowsCount === 1 ? "workflow" : "workflows"}
              </div>
            )}
            <div className={styles.resultsBody}>
              <div className={styles.workflowListFrame}>
                <WorkflowList
                  workflows={workflowArray}
                  loading={loading}
                  hasActiveFilters={hasActiveFilters}
                  clearFilters={clearFilters}
                />
                {loading && hasVisibleWorkflows && (
                  <div className={styles.loadingOverlay}>
                    <div className={styles.loadingIndicator}>
                      <Loader active inline />
                    </div>
                  </div>
                )}
              </div>
              {loading && !hasVisibleWorkflows && (
                <div className={styles.loadingOverlay}>
                  <div className={styles.loadingIndicator}>
                    <Loader active inline />
                  </div>
                </div>
              )}
              <div ref={listEndRef} aria-hidden="true" />
            </div>
            <div
              ref={footerRef}
              className={`${styles.paginationRow} ${
                workflowsCount <= pageSize
                  ? styles.paginationRowWithoutPagination
                  : ""
              } ${showContinuationCue ? styles.paginationRowWithCue : ""}`}
            >
              <div className={styles.pageSize}>
                <span>Show</span>
                <Dropdown
                  inline
                  aria-label="Results per page"
                  options={pageSizeOptions}
                  value={pageSize}
                  onChange={(_, { value }) => setPageSize(Number(value))}
                />
                <span>per page</span>
              </div>
              <div
                className={`${styles.paginationSlot} ${
                  showPagination ? "" : styles.paginationSlotEmpty
                }`}
                aria-hidden={!showPagination}
              >
                {showPagination && (
                  <Pagination
                    className={styles.pagination}
                    activePage={page}
                    totalPages={totalPages}
                    onPageChange={(_, { activePage }) => setPage(activePage)}
                  />
                )}
              </div>
            </div>
          </main>
        </div>
      </Container>
    </div>
  );
}
