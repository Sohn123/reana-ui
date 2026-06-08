/*
  -*- coding: utf-8 -*-

  This file is part of REANA.
  Copyright (C) 2026 CERN.

  REANA is free software; you can redistribute it and/or modify it
  under the terms of the MIT License; see LICENSE file for more details.
*/

import { useEffect } from "react";
import PropTypes from "prop-types";
import { Icon } from "semantic-ui-react";

import styles from "./LogSearchBar.module.scss";

export default function LogSearchBar({
  inputRef,
  query,
  onQueryChange,
  matchCount,
  activeIndex,
  capped,
  caseSensitive,
  wholeWord,
  onToggleCaseSensitive,
  onToggleWholeWord,
  onNext,
  onPrev,
  onClose,
}) {
  // Focus and select the field when the bar opens.
  useEffect(() => {
    const input = inputRef.current;
    if (input) {
      input.focus();
      input.select();
    }
  }, [inputRef]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (event.shiftKey) onPrev();
      else onNext();
    } else if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
  };

  const hasQuery = query.trim() !== "";
  const noResults = hasQuery && matchCount === 0;
  let counter = "";
  if (noResults) {
    counter = "No results";
  } else if (matchCount > 0) {
    counter = `${activeIndex + 1} / ${matchCount}${capped ? "+" : ""}`;
  }

  return (
    <div className={styles.bar} role="search">
      <input
        ref={inputRef}
        type="text"
        className={`${styles.input} ${noResults ? styles.error : ""}`}
        placeholder="Find in logs"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        onKeyDown={handleKeyDown}
        aria-label="Find in logs"
        spellCheck={false}
        autoComplete="off"
      />

      <span
        className={`${styles.counter} ${noResults ? styles["no-results"] : ""}`}
        aria-live="polite"
      >
        {counter}
      </span>

      <button
        type="button"
        className={`${styles.toggle} ${caseSensitive ? styles.active : ""}`}
        aria-label="Match case"
        aria-pressed={caseSensitive}
        title="Match case"
        onClick={onToggleCaseSensitive}
      >
        Aa
      </button>
      <button
        type="button"
        className={`${styles.toggle} ${wholeWord ? styles.active : ""}`}
        aria-label="Match whole word"
        aria-pressed={wholeWord}
        title="Match whole word"
        onClick={onToggleWholeWord}
      >
        <u>ab</u>
      </button>

      <button
        type="button"
        className={styles["icon-button"]}
        aria-label="Previous match"
        title="Previous match (Shift+Enter)"
        onClick={onPrev}
        disabled={matchCount === 0}
      >
        <Icon name="chevron up" fitted />
      </button>
      <button
        type="button"
        className={styles["icon-button"]}
        aria-label="Next match"
        title="Next match (Enter)"
        onClick={onNext}
        disabled={matchCount === 0}
      >
        <Icon name="chevron down" fitted />
      </button>
      <button
        type="button"
        className={styles["icon-button"]}
        aria-label="Close search"
        title="Close (Esc)"
        onClick={onClose}
      >
        <Icon name="close" fitted />
      </button>
    </div>
  );
}

LogSearchBar.propTypes = {
  inputRef: PropTypes.shape({ current: PropTypes.any }).isRequired,
  query: PropTypes.string.isRequired,
  onQueryChange: PropTypes.func.isRequired,
  matchCount: PropTypes.number.isRequired,
  activeIndex: PropTypes.number.isRequired,
  capped: PropTypes.bool,
  caseSensitive: PropTypes.bool.isRequired,
  wholeWord: PropTypes.bool.isRequired,
  onToggleCaseSensitive: PropTypes.func.isRequired,
  onToggleWholeWord: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrev: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
