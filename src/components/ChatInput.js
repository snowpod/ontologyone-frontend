import React, { useRef, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';

import parentStyles from '../Hr_demo.module.css';

const ChatInput = ({ onSubmit, onClear, nlQuery, setNlQuery, isInputEditable }) => {
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    setNlQuery(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isInputEditable) {
        onSubmit(nlQuery);
      }
    }
  };

  const handleClear = () => {
    onClear();

    // Reset the textarea height
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
    }
  };

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      const lineHeight = 24; // Estimate based on your CSS
      const minHeight = lineHeight * 2;
  
      textarea.style.height = "auto"; // Reset first
      const desiredHeight = textarea.scrollHeight;
  
      // Ensure height is at least 2 rows
      const newHeight = Math.max(desiredHeight, minHeight);
      textarea.style.height = `${newHeight}px`;
    }
  }, [nlQuery]);  

  return (
    <div>
      <label
        htmlFor="nl-query-input"
        className={`${parentStyles.label} block text-base font-semibold text-gray-700`}
      >
        Enter your question
      </label>

      <div
        id="nl-query-input-wrapper"  // ✅ make this match the whitelist selector
        className={parentStyles["nl-query-input-wrapper"]}
        style={{ position: 'relative' }}
      >
        <textarea
          id="nl-query-input"
          ref={textareaRef}
          rows="3"
          placeholder="Ask something... (Press Enter to send)"
          value={nlQuery}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={!isInputEditable}
          className={parentStyles.textarea}
          style={{ paddingRight: "3rem" }} // add padding to prevent typing running into the "x"
        />
        {nlQuery && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear input"
          className="absolute right-2 bottom-2 text-white bg-indigo-600 hover:bg-indigo-400 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 text-lg leading-normal font-semibold"
        >
          <svg width="11" height="11" viewBox="0 0 11 11" stroke="white">
            <line x1="1" y1="1" x2="11" y2="11" strokeWidth="2"/>
            <line x1="11" y1="1" x2="1" y2="11" strokeWidth="2"/>
          </svg>
        </button>
        )}
      </div>
    </div>
  );
};

ChatInput.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  nlQuery: PropTypes.string.isRequired,
  setNlQuery: PropTypes.func.isRequired,
  isInputEditable: PropTypes.bool.isRequired,
};

export default ChatInput;