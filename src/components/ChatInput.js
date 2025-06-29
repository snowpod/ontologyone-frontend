import React, { useRef, useLayoutEffect, useState } from 'react';
import PropTypes from 'prop-types';

import parentStyles from '../Hr_demo.module.css';

const ChatInput = ({ onSubmit, onClear, nlQuery, setNlQuery, isInputEditable }) => {
  const textareaRef = useRef(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleChange = (e) => {
    setNlQuery(e.target.value);
    if (hasSubmitted) setHasSubmitted(false); // Reset on new input after submit
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isInputEditable && nlQuery.trim() !== '') {
        onSubmit(nlQuery);
        setHasSubmitted(true);
      }
    }
  };

  const handleSendClick = () => {
    if (isInputEditable && nlQuery.trim() !== '') {
      onSubmit(nlQuery);
      setHasSubmitted(true);
    }
  };

  const handleClearClick = () => {
    onClear();
    setHasSubmitted(false);
    setNlQuery('');
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
        id="nl-query-input-wrapper"
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
          style={{ paddingRight: "2.7rem" }}
        />

        {/* Show Send button only when not submitted and input present */}
        {!hasSubmitted && nlQuery.trim() !== '' && (
          <button
            type="button"
            onClick={handleSendClick}
            aria-label="Send input"
            className="chat-send-button absolute right-2 bottom-2 text-white bg-indigo-600 hover:bg-indigo-400 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 text-lg leading-normal font-semibold"
          >
            {/* Right turn arrow */}
            <svg
              width="24px"
              height="24px"
              viewBox="0 0 26 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17.249 4.931v6.926c0 0.574-0.229 1.125-0.636 1.53-0.407 0.406-0.959 0.634-1.535 0.634H9.437v-2.164a0.867 0.867 0 0 0-1.482-0.612l-3.472 3.463a0.866 0.866 0 0 0 0 1.224l3.472 3.463a0.867 0.867 0 0 0 1.482-0.613v-2.164h5.642c1.266 0 2.48-0.502 3.376-1.395a4.748 4.748 0 0 0 1.398-3.367V4.931a0.868 0.868 0 0 0-0.868-0.866h-0.868a0.868 0.868 0 0 0-0.868 0.866z"
                fill="currentColor"
              />
            </svg>
          </button>
        )}

        {/* Show Reload button only after submit and input present */}
        {hasSubmitted && nlQuery.trim() !== '' && (
          <button
            type="button"
            onClick={handleClearClick}
            aria-label="Clear input"
            className="chat-clear-button absolute right-2 bottom-2 text-white bg-indigo-600 hover:bg-indigo-400 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 text-lg leading-normal font-semibold"
          >
            {/* Double-arrow reload */}
            <svg width="800px" height="800px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M7 12v-2l-4 3 4 3v-2h2.997A6.006 6.006 0 0 0 16 8h-2a4 4 0 0 1-3.996 4H7zM9 2H6.003A6.006 6.006 0 0 0 0 8h2a4 4 0 0 1 3.996-4H9v2l4-3-4-3v2z"
                fill="white"
                transform="scale(0.65) translate(4,4)"
                fillRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

ChatInput.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  nlQuery: PropTypes.string.isRequired,
  setNlQuery: PropTypes.func.isRequired,
  isInputEditable: PropTypes.bool.isRequired,
};

export default ChatInput;