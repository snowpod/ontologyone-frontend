import React, { useLayoutEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

import parentStyles from "../Hr_demo.module.css";

const SparqlOutput = ({ sparqlQuery }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    requestAnimationFrame(() => {
      textarea.style.height = "auto";

      const invisiblePadding = "\n\u200B"; // newline + zero-width space
      textarea.value = sparqlQuery + invisiblePadding;

      textarea.style.height = `${textarea.scrollHeight}px`;
    });
  }, [sparqlQuery, isExpanded]);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className={parentStyles["sparql-output"]}>
      <button
        onClick={toggleExpand}
        className="w-full text-left text-base font-semibold text-gray-700 bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200 transition"
      >
        {isExpanded ? "▼" : "▶"} Translated SPARQL query
      </button>

      {isExpanded && (
        <textarea
          id="sparql-query-textarea"
          ref={textareaRef}
          readOnly
          value={sparqlQuery}
          className={`${parentStyles["textareaNoWrap"]} font-mono text-base`}
        />
      )}
    </div>
  );
};

SparqlOutput.propTypes = {
  sparqlQuery: PropTypes.string.isRequired,
};

export default SparqlOutput;
