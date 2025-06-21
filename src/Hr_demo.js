import React, { useEffect, useRef, useState } from "react";

import API from "./config.js";
import ExampleQuestions from "./components/ExampleQuestions.js";
import ChatInput from "./components/ChatInput.js";
import LoadingAnimation from "./components/LoadingAnimation.js";
import SparqlOutput from "./components/SparqlOutput.js";
import ResultTable from "./components/ResultTable.js";
import FeedbackInput from "./components/FeedbackInput.js";

import styles from './Hr_demo.module.css';

const NO_INPUT_MSG = "Please enter a valid query.";

const Hr_demo = () => {
  const [nlQuery, setNlQuery] = useState("");
  const [sparqlQuery, setSparqlQuery] = useState("");
  const [results, setResults] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isInputEditable, setIsInputEditable] = useState(true);
  const feedbackRef = useRef(null);

  const exampleQuestions = API.APP_QUESTIONS; 
  
  useEffect(() => {
    if (showFeedback && feedbackRef.current?.scrollToBottom) {
      setTimeout(() => {
        feedbackRef.current.scrollToBottom();
      }, 100); // Small delay to let it render
    }
  }, [showFeedback]);
  
  const handleFeedbackExpand = () => {
    setTimeout(() => {
      feedbackRef.current.scrollToBottom(); // Uses exposed scrollToBottom in FeedbackInput
    }, 100); // Small delay gives React time to render the expanded content
  };

  const handleClear = () => {
    console.log("Clearing input...");
    setNlQuery("");
    setSparqlQuery("");
    setResults("");
    setErrorMessage("");
    setShowFeedback(false);
    setIsInputEditable(true);
    setIsSubmitting(false);
  };
  
  const handleNlQuerySubmit = async (nlQuery) => {
    console.log("nlQuery: ", nlQuery)
    if (!nlQuery.trim()) {
      setErrorMessage(NO_INPUT_MSG);
      setIsInputEditable(false);
      return;
    }
  
    setIsSubmitting(true);
    setIsInputEditable(false);
    setErrorMessage("");
    setSparqlQuery(""); 
    setResults("");

    try {
      console.log("going to get response:", API.PROCESS_QUERY)
      const response = await fetch(API.PROCESS_QUERY, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ nl_query: nlQuery }),
      });

      console.log("response: ", response)
      const data = await response.json();
      setSparqlQuery(data.sparql_query);
      setResults(data.result_html);
      if (data.error) {
        setErrorMessage(data.error);
      }
  
      setShowFeedback(true);

    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("An error occurred, please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeedback = ({ comment, rating }) => {
    console.log("Feedback submitted:", comment, rating);
    if (!nlQuery || !sparqlQuery) {
      console.error("Feedback cannot be submitted: Missing query data.");
      return;
    }

    const feedbackData = {
      rating: rating,
      comment: comment,
      nl_query: nlQuery,
      sparql_query: sparqlQuery,
    };

    fetch(API.SUBMIT_FEEDBACK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(feedbackData),
    })
      .then((response) => response.json())
      .then((data) => console.log("Feedback submitted:", data))
      .catch((error) => console.error("Error logging feedback:", error));
  };

  return (
    <div className={styles.hrDemoTabPanel}>
      <div className={styles.inputContainer}>
        <div className={`${styles.exampleQuestions} text-sm`}>
          <ExampleQuestions questions={exampleQuestions} />
        </div>
        <ChatInput
          onSubmit={handleNlQuerySubmit}
          onClear={handleClear}
          nlQuery={nlQuery}
          setNlQuery={setNlQuery}
          isInputEditable={isInputEditable}
        />
      </div>

      {console.log("isSubmitting: ", isSubmitting)}
      {console.log("sparqlQuery: ", sparqlQuery)}
      {console.log("errorMessage: ", errorMessage)}
      {console.log("showFeedback: ", showFeedback)}
      {isSubmitting && (!sparqlQuery || !errorMessage) && <LoadingAnimation />}

      {(!isSubmitting && (sparqlQuery || errorMessage || showFeedback)) && (
        <div className={styles.outputContainer}>
          <>
          <div className={styles.sparqlOutput}>
            <SparqlOutput sparqlQuery={sparqlQuery} />
            {results && (
              <ResultTable results={results} />
            )}
          </div>
          </>
          {!isSubmitting && errorMessage &&!results && (
            <p className={`${styles.styledMessage} text-base`}>
              {errorMessage}
            </p>
          )}

          {!isSubmitting && (showFeedback || errorMessage) && (
            <>
              <div>
                <hr className={styles.feedbackDivider} />
              </div>
              <div className={styles.feedbackContainer}>
                <FeedbackInput 
                  ref={feedbackRef}
                  onFeedback={handleFeedback} 
                  onExpand={handleFeedbackExpand}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Hr_demo;