import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";

import parentStyles from "../Hr_demo.module.css";
import styles from "./ResultTable.module.css";

const ResultTable = ({ results }) => {
  console.log("results: ", results);

  return (
    <div className={parentStyles["resultOutput"]}>
      <label className={`${parentStyles.label} block text-base font-semibold text-gray-700`}>
        Results
      </label>
      {results ? (
        <div className={`${styles["resultWrapper"]} font-mono text-base`}>
          <div className={styles["scrollableTableWrapper"]}>
            <table
              className={styles["resultTable"]}
              dangerouslySetInnerHTML={{ __html: results }}
            />
          </div>
        </div>
      ) : (
        <div className="font-mono text-base" style={{ margin: "8px" }}>
          No results found.
        </div>
      )}
    </div>
  );
};

ResultTable.propTypes = {
  results: PropTypes.string.isRequired,
};

export default ResultTable;