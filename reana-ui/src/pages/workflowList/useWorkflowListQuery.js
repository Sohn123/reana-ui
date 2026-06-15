/*
  -*- coding: utf-8 -*-

  This file is part of REANA.
  Copyright (C) 2026 CERN.

  REANA is free software; you can redistribute it and/or modify it
  under the terms of the MIT License; see LICENSE file for more details.
*/

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  serializeQueryToApiParams,
  WORKFLOW_LIST_DEFAULT_PAGE_SIZE,
  parseWorkflowListQuery,
} from "./workflowListQuery";

const resetPage = (queryParams) => {
  queryParams.delete("page");
};

const updateParams = (setSearchParams, mutator, options = {}) => {
  setSearchParams((previous) => {
    const next = new URLSearchParams(previous);
    mutator(next);
    return next;
  }, options);
};

export function useWorkflowListQuery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = useMemo(
    () => parseWorkflowListQuery(searchParams),
    [searchParams],
  );
  const [searchText, setSearchText] = useState(query.search);

  useEffect(() => {
    setSearchText(query.search);
  }, [query.search]);

  useEffect(() => {
    const rawPage = searchParams.get("page");
    const page = Number.parseInt(rawPage || "", 10);
    const shouldRemovePage =
      searchParams.has("page") &&
      (!rawPage || !Number.isFinite(page) || page <= 1);

    if (shouldRemovePage) {
      updateParams(setSearchParams, resetPage, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (searchParams.get("status") === "deleted") {
      updateParams(
        setSearchParams,
        (next) => {
          next.delete("status");
          resetPage(next);
        },
        { replace: true },
      );
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const hasLegacySharingParams =
      searchParams.has("shared") ||
      searchParams.has("shared-by") ||
      searchParams.get("owned-by") === "you" ||
      searchParams.get("shared-with") === "true";

    if (hasLegacySharingParams) {
      const { ownedBy, sharedWith } = parseWorkflowListQuery(searchParams);
      updateParams(
        setSearchParams,
        (next) => {
          next.delete("shared");
          next.delete("shared-by");
          next.delete("owned-by");
          next.delete("shared-with");
          if (sharedWith !== undefined) {
            next.set("shared-with", sharedWith);
          } else if (ownedBy) {
            next.set("owned-by", ownedBy);
          }
        },
        { replace: true },
      );
    }
  }, [searchParams, setSearchParams]);

  const submitSearch = useCallback(() => {
    const nextSearch = searchText.trim();
    updateParams(setSearchParams, (next) => {
      if (nextSearch) {
        next.set("search", nextSearch);
      } else {
        next.delete("search");
      }
      resetPage(next);
    });
  }, [searchText, setSearchParams]);

  const setPage = useCallback(
    (nextPage) => {
      updateParams(setSearchParams, (next) => {
        if (nextPage > 1) {
          next.set("page", String(nextPage));
        } else {
          next.delete("page");
        }
      });
    },
    [setSearchParams],
  );

  const setPageSize = useCallback(
    (nextPageSize) => {
      updateParams(setSearchParams, (next) => {
        if (nextPageSize && nextPageSize !== WORKFLOW_LIST_DEFAULT_PAGE_SIZE) {
          next.set("page-size", String(nextPageSize));
        } else {
          next.delete("page-size");
        }
        resetPage(next);
      });
    },
    [setSearchParams],
  );

  const setStatus = useCallback(
    (nextStatus) => {
      updateParams(setSearchParams, (next) => {
        if (nextStatus) {
          next.set("status", nextStatus);
        } else {
          next.delete("status");
        }
        resetPage(next);
      });
    },
    [setSearchParams],
  );

  const setIncludeDeleted = useCallback(
    (on) => {
      updateParams(setSearchParams, (next) => {
        if (on) {
          next.set("show-deleted", "true");
        } else {
          next.delete("show-deleted");
        }
        resetPage(next);
      });
    },
    [setSearchParams],
  );

  const setSort = useCallback(
    (nextSort) => {
      updateParams(setSearchParams, (next) => {
        if (nextSort && nextSort !== "desc") {
          next.set("sort", nextSort);
        } else {
          next.delete("sort");
        }
        resetPage(next);
      });
    },
    [setSearchParams],
  );

  const setShowOpenSessionsOnly = useCallback(
    (on) => {
      updateParams(setSearchParams, (next) => {
        if (on) {
          next.set("open-sessions", "true");
        } else {
          next.delete("open-sessions");
        }
        resetPage(next);
      });
    },
    [setSearchParams],
  );

  const setSharing = useCallback(
    (ownedBy, sharedWith) => {
      updateParams(setSearchParams, (next) => {
        next.delete("shared"); // remove legacy param on every write
        next.delete("shared-by"); // remove legacy param on every write
        if (sharedWith !== undefined) {
          next.set("shared-with", sharedWith);
          next.delete("owned-by");
        } else {
          next.delete("shared-with");
          if (ownedBy) {
            next.set("owned-by", ownedBy);
          } else {
            next.delete("owned-by"); // both undefined -> default "Your workflows" view
          }
        }
        resetPage(next);
      });
    },
    [setSearchParams],
  );

  const clearFilters = useCallback(() => {
    setSearchText("");
    updateParams(setSearchParams, (next) => {
      next.delete("search");
      next.delete("status");
      next.delete("show-deleted");
      next.delete("open-sessions");
      if (next.get("owned-by")) {
        next.set("owned-by", "anybody");
      } else {
        next.delete("owned-by");
      }
      next.delete("shared-with");
      next.delete("shared");
      next.delete("shared-by");
      resetPage(next);
    });
  }, [setSearchParams]);

  const hasActiveFilters =
    Boolean(query.search) ||
    query.hasStatusFilter ||
    query.includeDeleted ||
    query.showOpenSessionsOnly ||
    (Boolean(query.ownedBy) && query.ownedBy !== "anybody") ||
    query.sharedWith !== undefined;

  const requestParams = useMemo(
    () => serializeQueryToApiParams(query),
    [query],
  );

  return {
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
  };
}
