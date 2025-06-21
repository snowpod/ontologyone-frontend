import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";

import API from "../config.js";

import styles from "./FeedbackInput.module.css";

const FeedbackInput = forwardRef(({ onFeedback, onExpand }, ref) => {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [isExpanded, setIsExpanded] = useState(false);
  const [reply, setReply] = useState("");
  const [sliderTouched, setSliderTouched] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const bottomRef = useRef(null);

  const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const toggleExpanded = () => {
    setIsExpanded(prev => {
      const next = !prev;
      if (next && typeof onExpand === "function") {
        onExpand();
      }
      return next;
    });
  };

  useImperativeHandle(ref, () => ({
    scrollToBottom: () => {
      const el = bottomRef.current;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        window.scrollBy(0, -30); // scroll a bit more for extra space
      }
    },
  }));
  
  const {
    header: feedback_header,
    slider_marker,
    reply: feedback_reply,
    reward: {
      positive: { mealtime, snack },
      neutral,
      negative,
    },
    easter_egg: {
      reply: feedback_reply_easter_egg,
      emoji: easter_egg,
      fortune,
    }
  } = API.APP_FEEDBACK;
  
  const positive_slider_marker = slider_marker.positive;
  const negative_slider_marker = slider_marker.negative;

  const getSentimentClass = (value) => {
    if (value >= 7) return "positive";
    if (value <= 3) return "negative";
    return "neutral";
  };

  const getRandomFortune = () => {
    const fortunes = fortune;
    return fortunes[Math.floor(Math.random() * fortunes.length)];
  };

  const getRandomReward = (sentiment) => {
    const isFortuneCookie = Math.random() < 0.03;
    if (isFortuneCookie) {
      return { emoji: easter_egg, fortune: getRandomFortune() };
    }
  
    if (sentiment === "negative") {
      return { emoji: randomFrom(negative) };
    }
    if (sentiment === "neutral") {
      return { emoji: randomFrom(neutral) };
    }
  
    // sentiment === "positive"
    const now = new Date();
    const hour = now.getHours();
    const isMealtime = (hour >= 12 && hour < 14) || (hour >= 17 && hour < 19);
    return {
      emoji: isMealtime ? randomFrom(mealtime) : randomFrom(snack),
    };
  };  

  const generateReply = (sentiment) => {
    const { emoji, fortune } = getRandomReward(sentiment);
  
    if (emoji === easter_egg && fortune) {
      return feedback_reply_easter_egg(emoji, fortune);
    }
  
    return feedback_reply(emoji); // calls your reply function with the emoji
  };

  const handleSliderKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const sentiment = getSentimentClass(rating);
      onFeedback?.({ comment, rating });
      setReply(generateReply(sentiment));
      //setComment("");
      //setRating(5);
      setIsSubmitted(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (comment.trim()) {
        let sentiment = getSentimentClass(rating);
        onFeedback({ comment, rating });
        setReply(generateReply(sentiment));
        //setComment("");
        //setRating(5);
        setIsSubmitted(true);
      }
    }
  };

  return (
    <div className={styles.feedbackWrapper}>
      <button
        className={`${styles.feedbackHeader} text-sm ${isExpanded ? styles.open : ""} `}
        onClick={toggleExpanded}
      >
        {isExpanded ? `▼ ${feedback_header}` : `▶ ${feedback_header}`}
      </button>
      {isExpanded && (
      <div className={styles.sliderWrapper}>
        <div className={styles.sliderRow}>
          <span className={`${styles.thumb} text-base`}>
            {negative_slider_marker}
          </span>
          <input
            id="rating"
            type="range"
            min="0"
            max="10"
            value={rating}
            onChange={(e) => {
              setRating(Number(e.target.value));
              setSliderTouched(true);
            }}
            onKeyDown={handleSliderKeyDown}
            disabled={isSubmitted}
            className={`${styles.slider} ${styles[getSentimentClass(rating)]}`}
          />
          <span className={`${styles.thumb} text-base`}>
            {positive_slider_marker}
          </span>
        </div>
        <div
          className={`${styles.sliderFeedbackLine} text-sm ${
            sliderTouched ? styles.show : ""
          }`}
        >
          {sliderTouched && `You think we are ${rating}🌟. Leave a comment or just press Enter when you're ready.`}
        </div>
        <textarea
          ref={bottomRef}
          id="comment"
          rows="3"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="(Optional) Tell us more..."
          disabled={isSubmitted}
          className={styles.textarea}
        />
          {reply && (
            <div className="bg-white p-2 border rounded-lg transition-opacity duration-300 ease-in-out mt-2">
              {reply}
            </div>
          )}
        </div>
      )}



    </div>
  );
});

export default FeedbackInput; 