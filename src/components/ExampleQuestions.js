import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

import parentStyles from "../Hr_demo.module.css";
import styles from "./ExampleQuestions.module.css";

const ExampleQuestions = ({ questions }) => {
  const section_header = "Don't know how to get started? Try asking these questions.";
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close the accordion when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target) &&
        !event.target.closest(".chat-send-button") &&   // or give the "<-" a unique ID/class
        !event.target.closest(".chat-clear-button")     // or give the "x" a unique ID/class
      ) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  return (
    <div ref={wrapperRef} className={`${parentStyles["accordion"]} text-sm`}> 
      <button
        className={`${styles["accordion-header"]} text-left focus:outline-none focus:ring-0 rounded-lg p-2 hover:bg-gray-200 transition duration-300 ease-in-out`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? `▲ ${section_header}` : `▼ ${section_header}`}
      </button>

      {isOpen && (
        <div className={`${styles["accordion-content"]} fade-in max-h-[116px] overflow-y-auto bg-white shadow-md p-2 pl-5`}> 
          {questions && questions.length > 0 ? (
            questions.map((question, index) => <li key={index}>{question}</li>)
          ) : (
            <li>No questions available</li>
          )}
        </div>
      )}
    </div>
  );
};

ExampleQuestions.propTypes = {
  questions: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ExampleQuestions;
