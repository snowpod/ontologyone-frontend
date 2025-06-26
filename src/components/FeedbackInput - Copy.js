import React, { useEffect, useLayoutEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import API from "../config.js";
import styles from "./FeedbackInput.module.css";

const FeedbackInput = forwardRef(({ onFeedback, onExpand }, ref) => {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(3); // range 1–5
  const [prefilled, setPrefilled] = useState("");
  const [initialRatingAtFirstInput, setInitialRatingAtFirstInput] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sliderTouched, setSliderTouched] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reply, setReply] = useState("");
  const [hasUserTyped, setHasUserTyped] = useState(false);

  const textareaRef = useRef(null);
  const bottomRef = useRef(null);

 const [shouldMoveCursorAfterPrefill, setShouldMoveCursorAfterPrefill] = useState(false); 
  const getBase = (rating) => `${placeholderMap[rating - 1]} because `;
  const getFull = (base) => `${base}... (Press Enter to submit)`;

  const emojiMap = ["😞", "☹️", "😐", "😊", "🤩"];
  const placeholderMap = [
    "I really didn't enjoy it",
    "It didn't work for me",
    "It's okay, but could be better",
    "I liked it! Especially",
    "Super like it! So easy and fun to use"
  ];

  const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  useLayoutEffect(() => {
    if (shouldMoveCursorAfterPrefill && textareaRef.current) {
      const pos = prefilled.length;
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(pos, pos);
      setShouldMoveCursorAfterPrefill(false);
    }
  }, [shouldMoveCursorAfterPrefill, prefilled]);

  const toggleExpanded = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      if (next && typeof onExpand === "function") {
        onExpand();
      }

      if (next && !comment.trim()) {
        const base = getBase(rating);
        const full = getFull(base);
        setPrefilled(base);
        setComment(full);
        console.log("Rendered comment 111:", comment, ", should me:", full);
        //setShouldMoveCursorAfterPrefill(true);
      }

      return next;
    });
  };

  useImperativeHandle(ref, () => ({
    scrollToBottom: () => {
      const el = bottomRef.current;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        window.scrollBy(0, -30);
      }
    },
  }));

  const textarea = textareaRef.current;
  if (textarea) {
    const cursorPosition = textarea.selectionStart;
    const becauseIndex = comment.indexOf(" because") + " because".length;

    if (cursorPosition === becauseIndex) {
      console.log("✅ Cursor is just after ' because'");
    } else {
      console.log("⚠️ Cursor is somewhere else");
    }
  }

  const appName = API.APP_NAME;
  const {
    header: feedback_header,
    reply_match: feedback_reply_match,
    reply_mismatch: feedback_reply_mismatch,
    reply_reward: feedback_reply_reward,
    slider_marker,
    reward: {
      positive: { mealtime, snack },
      neutral,
      negative,
    },
    easter_egg: {
      reply: feedback_reply_easter_egg,
      emoji: easter_egg,
      fortune,
    },
  } = API.APP_FEEDBACK;

  const getSentimentClass = (value) => {
    if (value >= 4) return "positive";
    if (value <= 2) return "negative";
    return "neutral";
  };

  const getRandomFortune = () => {
    return fortune[Math.floor(Math.random() * fortune.length)];
  };

  const getRandomReward = (sentiment) => {
    const isFortuneCookie = Math.random() < 0.03;
    if (isFortuneCookie) {
      return { emoji: easter_egg, fortune: getRandomFortune() };
    }

    if (sentiment === "negative") return { emoji: randomFrom(negative) };
    if (sentiment === "neutral") return { emoji: randomFrom(neutral) };

    const now = new Date();
    const hour = now.getHours();
    const isMealtime = (hour >= 12 && hour < 14) || (hour >= 17 && hour < 19);
    return {
      emoji: isMealtime ? randomFrom(mealtime) : randomFrom(snack),
    };
  };

  const generateReply = (sentiment, mismatch, rating, hasComment) => {
    const { emoji, fortune } = getRandomReward(sentiment);

    if (emoji === easter_egg && fortune) {
      return feedback_reply_easter_egg(emoji, fortune);
    }

    const base = mismatch
      ? feedback_reply_mismatch
      : feedback_reply_match(rating, hasComment);

    return `${base}${feedback_reply_reward(emoji)}`;
  };

  const handleSliderChange = (e) => {
    const newRating = Number(e.target.value);
    setRating(newRating);
    setSliderTouched(true);

    if (!hasUserTyped) {
      const base = `${placeholderMap[newRating - 1]} because `;
      const full = `${base}... (Press Enter to submit)`;

      setPrefilled(base);
      setComment(full);

      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = base.length;
        }
      });
    }
  };

  const handleTextareaFocus = () => {
    if (!comment.trim()) {
      const base = getBase(rating);
      const full = getFull(base);
      setPrefilled(base);
      setComment(full);
      console.log("Rendered comment 222:", JSON.stringify(comment));
      setShouldMoveCursorAfterPrefill(true);
    } 
    else if (comment.includes("(Press Enter to submit)")) {
      const base = comment.replace(/\s*\.\.\.\s*\(Press Enter to submit\)/, "").trimEnd();
      setComment(base + " ");
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.selectionStart = textarea.selectionEnd = base.length + 1;
      }
    }
  };

  const detectPlatform = () => {
    const ua = navigator.userAgent || "";
    const uaData = navigator.userAgentData;

    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isAndroid = /Android/.test(ua);

    // Optionally: use UA hints (modern browsers)
    if (uaData && uaData.platform) {
      if (/iOS/.test(uaData.platform)) return { isIOS: true, isAndroid: false, isMobile: true };
      if (/Android/.test(uaData.platform)) return { isIOS: false, isAndroid: true, isMobile: true };
    }

    return {
      isIOS,
      isAndroid,
      isMobile: isIOS || isAndroid,
    };
  };

  const moveCursorToEndOfPrefill = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const pos = (prefilled || "").length;

    // Adjust the delay based on platform
    // iOS needs a longer delay and user interaction
    const { isIOS } = detectPlatform();
    const delay = isIOS ? 500 : 300;

    textarea.focus(); // must be called before selection in most mobile cases

    setTimeout(() => {
      try {
        textarea.setSelectionRange(pos, pos);
      } catch (e) {
        console.warn("Could not set cursor:", e);
      }
    }, delay);
  };


  const handleCommentChange = (e) => {
    const value = e.target.value;
    setComment(value);

    if (value !== prefilled && value.trim() !== "") {
      if (!hasUserTyped) {
        setHasUserTyped(true);
        if (initialRatingAtFirstInput === null) {
          setInitialRatingAtFirstInput(rating);
        }
      }
    } else {
      setHasUserTyped(false);
    }
  };

  const handleClear = () => {
    setComment("");
    setPrefilled("");
    setHasUserTyped(false);
    textareaRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (comment.trim() || sliderTouched) {
        const sentiment = getSentimentClass(rating);
        const mismatch =
          hasUserTyped && initialRatingAtFirstInput !== null &&
          initialRatingAtFirstInput !== rating;

        const hasComment = hasUserTyped && comment.trim() !== "";

        onFeedback?.({ comment: comment.trim() || prefilled, rating });
        setReply(generateReply(sentiment, mismatch, rating, hasComment));
        setIsSubmitted(true);
      }
    }
  };

  return (
    <div
      className={styles.feedbackWrapper}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey && document.activeElement !== textareaRef.current) {
          e.preventDefault();
          if (!hasUserTyped && !isSubmitted) {
            const sentiment = getSentimentClass(rating);
            const mismatch = false; // no comment, so no mismatch
            onFeedback?.({ comment: placeholderMap[rating - 1], rating });
            setReply(generateReply(sentiment, mismatch, rating, false));
            setIsSubmitted(true);
          }
        }
      }}
    >
      <button
        className={`${styles.feedbackHeader} text-left text-sm focus:outline-none focus:ring-0 rounded-lg p-2 hover:bg-gray-200 transition duration-300 ease-in-out`}
        onClick={toggleExpanded}
      >
        {isExpanded ? `▼ ${feedback_header(appName)}` : `▶ ${feedback_header(appName)}`}
      </button>

      {isExpanded && (
        <div className={styles.sliderWrapper}>
          {/* Emoji + Slider */}
          <div className={styles.sliderRow}>
            <span className="text-lg sm:text-xl md:text-2xl">{emojiMap[rating - 1]}</span>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={rating}
              onChange={handleSliderChange}
              disabled={isSubmitted}
              className={`${styles.slider} ${styles[getSentimentClass(rating)]}`}
            />
          </div>

          {/* Dynamic Placeholder + Clear Button */}
          <div className={styles.textareaContainer}>
            <textarea
              ref={textareaRef}
              rows="2"
              value={comment}
              onChange={handleCommentChange}
              onFocus={handleTextareaFocus}
              onTouchEnd={moveCursorToEndOfPrefill} // required for mobile/iOS
              onKeyDown={handleKeyDown}
              placeholder={`${placeholderMap[rating - 1]} because`}
              disabled={isSubmitted}
              className={`${styles.textarea} ${
                !hasUserTyped && comment.startsWith(prefilled) ? styles.placeholderLike : 'text-black'
              }`}
            />
            {!isSubmitted && hasUserTyped && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear input"
                className="absolute right-2 bottom-4 text-white bg-indigo-600 hover:bg-indigo-400 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 text-sm"
              >
                <svg width="11" height="11" viewBox="0 0 11 11" stroke="white">
                  <line x1="1" y1="1" x2="11" y2="11" strokeWidth="2"/>
                  <line x1="11" y1="1" x2="1" y2="11" strokeWidth="2"/>
                </svg>
              </button>
            )}
          </div>

          {/* Reply message */}
          {reply && (
            <div className="bg-white p-2 border rounded-lg transition-opacity duration-300 ease-in-out mt-2">
              {reply}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
});

export default FeedbackInput;