import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import DOMPurify from "dompurify";

import API from "./config.js";
import ExampleQuestions from "./components/ExampleQuestions.js";

import styles from './Chatbot.module.css';

const Chatbot = () => {
  const appName = API?.APP_NAME || "HR Demo";
  const botName = API?.BOT_NAME || "Chatbot";
  const exampleQuestions = API?.CHATBOT_QUESTIONS(appName) || [];
  const defaultUserBubbleColor = API?.CHATBOT_UI?.chatBubbleColor?.user || "#ADD8E6";
  const defaultBotBubbleColor = API?.CHATBOT_UI?.chatBubbleColor?.bot || "#D3D3D3";

  const openingScriptAvatar = API.CHATBOT_INTERACTIONS.opening_script.avatar || "";
  const openingScriptText = API.CHATBOT_INTERACTIONS.opening_script.text(openingScriptAvatar, appName, botName) || "Welcome!";
  const openingScriptUsernameLabel = API?.CHATBOT_INTERACTIONS?.opening_script?.username_label || "What's your name?";
  const openingScriptFavoriteColorLabel = API?.CHATBOT_INTERACTIONS?.opening_script?.favorite_color_label || "What's your favorite color?";
  
  const chatInput_placeholder = API?.CHATBOT_INTERACTIONS?.chatInput_placeholder || "";
  const feedbackInput_placeholder = API?.CHATBOT_FEEDBACK?.chatInput_placeholder || "";
  const feedbackButton_Tooltip = API?.CHATBOT_FEEDBACK?.button_tooltip || "";
  const feedback_reply = API?.CHATBOT_FEEDBACK?.reply || "On behalf of the team, thanks for helping us make things better! 🫴💐";

  const thinking_response_trailer = API.CHATBOT_INTERACTIONS?.thinking_response_trailer || "";
  const typing_response_trailer = API.CHATBOT_INTERACTIONS?.typing_response_trailer || "";
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const randomDelay = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const [chatHistory, setChatHistory] = useState([]);
  const [userName, setUserName] = useState("");
  const [favoriteColor, setFavoriteColor] = useState("");
  const [pastelColor, setPastelColor] = useState(defaultUserBubbleColor);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [message, setMessage] = useState("");

  const [isBotThinking, setIsBotThinking] = useState(false); 
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [trailerIndex, setTrailerIndex] = useState(0);
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  const [feedbackMode, setFeedbackMode] = useState(false);
  //const [isFeedbackMode, setIsFeedbackMode] = useState(false);
  const toggleFeedbackMode = () => {
    setIsFeedbackMode((prev) => !prev);
  };

  // Runs only once on page load
  useEffect(() => {
    const storedInfo = localStorage.getItem('chatbot_user_info');
    console.log("storedInfo on page load:", storedInfo); // <--- safe
    if (storedInfo) {
      try {
        const { userName, favoriteColor, pastelColor } = JSON.parse(storedInfo);
        setUserName(userName);
        setFavoriteColor(favoriteColor);
        setPastelColor(pastelColor || defaultUserBubbleColor);
        //setIsSetupComplete(true);
      } catch (error) {
        console.error("Failed to parse chatbot_user_info:", error);
        localStorage.removeItem('chatbot_user_info');
      }
    }
  }, []); // [] means no dependencies

  useEffect(() => {
    console.log("isSetupComplete changed to:", isSetupComplete);
  }, [isSetupComplete]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  };

  // Scroll to bottom whenever chatHistory changes
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Scroll to bottom whenever chatbot is typing or thinking
  useEffect(() => {
    let timeout;
  
    const startRandomLoop = (trailerArray, min, max) => {
      const run = () => {
        setTrailerIndex(prev => (prev + 1) % trailerArray.length);
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        timeout = setTimeout(run, delay);
      };
      run();
    };
  
    if (Array.isArray(thinking_response_trailer) && isBotThinking) {
      startRandomLoop(thinking_response_trailer, 250, 500); // smooth thoughtful
    } else if (Array.isArray(typing_response_trailer) && isBotTyping) {
      startRandomLoop(typing_response_trailer, 120, 400); // more human typing
    }
  
    return () => clearTimeout(timeout);
  }, [isBotThinking, isBotTyping, thinking_response_trailer, typing_response_trailer]);   

  const generatePastelColor = (colorName, defaultColor) => {
    const colorMap = {
      black: "#DEDEE3",       // pastel black → soft gray
      blue: "#ddebf5",        // pastel blue
      brown: "#f4e9dc",       // pastel brown → tan/cream
      cyan: "#ddf5eb",        // pastel cyan
      gray: "#EBEBEE",        // pastel gray
      grey: "#EBEBEE",        // pastel grey
      green: "#e4f5dd",       // pastel green
      orange: "#ffe5b4",      // softened orange/peach
      pink: "#fce6e6",        // pastel pink
      purple: "#f3e8ff",      // pastel purple
      red: "#f9caca",         // pastel red (lightened)
      yellow: "#fdfd96",      // pastel yellow (butter)
      white: "#EBEBEE",       // off-white
    };
    return colorMap[colorName.toLowerCase()] || defaultColor;
  };

  const handleClear = () => {
    setMessage("");

    // Reset the textarea height
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
    }
  };

  const handleSetupComplete = async () => {
    const generatedColor = generatePastelColor(favoriteColor, defaultUserBubbleColor);
    setPastelColor(generatedColor);
    setIsSetupComplete(true);

    localStorage.setItem('chatbot_user_info', JSON.stringify({
      userName,
      favoriteColor,
      pastelColor: generatedColor,
    }));

    // 1. 🟢 Show greeting + latency warning immediately
    const botFirstMessage = API.CHATBOT_INTERACTIONS.initial_response(userName) ||
      "Hello! What would you like to know today?";
    setChatHistory((prev) => [
      ...prev,
      { sender: botName, text: botFirstMessage },
    ]);

    // 2. 🟡 Call backend in background
    if (!API?.START_CHAT) {
      console.error("API.START_CHAT is not defined");
      return;
    }

    try {
      const response = await fetch(API.START_CHAT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSessionId(data.session_id);

        // 3. 🟢 Show "Harper is ready" confirmation
        const readyMessage = API.CHATBOT_INTERACTIONS.ready_message || "I'm all set! Ask me anything.";
        setChatHistory((prev) => [
          ...prev,
          { sender: botName, text: readyMessage },
        ]);
      } else {
        console.error("Failed to start chat session");
      }
    } catch (error) {
      console.error("Error starting chat session:", error);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!message.trim()) return;

    // Append user + confirmation messages to chat
    setChatHistory((prev) => [
      ...prev,
      { sender: userName, text: message, isFeedback: true },
      { sender: botName, text: feedback_reply, isFeedback: true}
    ]);

    // Clear message and exit feedback mode
    const feedbackText = message;
    setMessage("");
    setFeedbackMode(false)

    // Send feedback to backend
    try {
      await fetch(`${API.CHAT_FEEDBACK}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          feedback: feedbackText,
          user: userName,
        }),
      });
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !sessionId) return;

    const userMessage = { sender: userName, text: message };
    setChatHistory((prev) => [...prev, userMessage]);
    setMessage("");
  
    setIsBotThinking(true);
    setTrailerIndex(0); // Reset trailer animation
  
    // Add "thinking..." message to chat history
    const thinkingMsg = {
      sender: botName,
      text: API.CHATBOT_INTERACTIONS.thinking_response,
      isThinking: true,
    };
    setChatHistory((prev) => [...prev, thinkingMsg]);
  
    try {
      const minThinkingDisplayTime = (thinking_response_trailer?.length || 3) * 500;
      await sleep(minThinkingDisplayTime); // ensure one full trailer cycle at least

      setIsBotThinking(false);
      setTrailerIndex(0);
      
      // Replace thinking with typing
      setChatHistory((prev) =>
        [...prev.filter((msg) => !msg.isThinking),
          {
            sender: botName,
            text: API.CHATBOT_INTERACTIONS.typing_response,
            isTyping: true,
          }
        ]
      );
      setIsBotTyping(true);
      setTrailerIndex(0);
  
      await sleep(randomDelay(1000, 1800));
  
      const response = await fetch(`${API.CHAT}/${sessionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ user_message: message }),
      });
  
      const textResponse = await response.text();
  
      if (response.ok) {
        const data = JSON.parse(textResponse);
        const botResponse = { sender: botName, text: data.bot_response };
        setChatHistory((prev) =>
          [...prev.filter((msg) => !msg.isTyping), botResponse]
        );
      } else {
        setChatHistory((prev) =>
          [...prev.filter((msg) => !msg.isTyping), {
            sender: botName,
            text: "Oops, something went wrong. Please try again later.",
          }]
        );
      }
    } catch (error) {
      console.error("Error generating bot response:", error);
      setChatHistory((prev) =>
        [...prev.filter((msg) => !msg.isTyping), {
          sender: botName,
          text: "Sorry, I am unable to process your request right now.",
        }]
      );
    } finally {
      setIsBotTyping(false);
    }
  }; 

  return (
    <div className={styles.chatbotTabPanel}>
      {!isSetupComplete ? (
        <div>
          <div className="flex justify-center">
            <div className={styles.selfIntroContainer}>
              <p className="text-base text-gray-700 mb-2" dangerouslySetInnerHTML={{ __html: openingScriptText }}></p>
              <label
                htmlFor="userName"
                className={`${styles.label} block text-base font-semibold text-gray-700`}
              >
                {openingScriptUsernameLabel}
              </label>
              <input
                id="userName"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    document.getElementById('favoriteColor')?.focus(); // move to favorite color input
                  }
                }}
                className="w-full p-2 border rounded-lg"
                placeholder="Enter your name"
              />
              <br/><br/>
              <label
                htmlFor="favoriteColor"
                className={`${styles.label} block text-base font-semibold text-gray-700`}
              >
                {openingScriptFavoriteColorLabel}
              </label>
              <input
                id="favoriteColor"
                type="text"
                value={favoriteColor}
                onChange={(e) => setFavoriteColor(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSetupComplete(); // trigger Start Chatting automatically if user presses Enter here
                  }
                }}
                className="w-full p-2 border rounded-lg"
                placeholder="Enter a color — blue, pink, green… or Press Enter to let Harper pick!"
              />
              <br/><br/>
              <div className="flex justify-start">
                <button className={styles.startButton} onClick={handleSetupComplete}>
                  Start Chatting
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.chatbotContainer}>
            <div className={`${styles.chatCanvas} flex-grow overflow-y-auto space-y-3 p-4`}>
              {chatHistory.length === 0 ? (
                <p>No messages yet.</p>
              ) : (
                <>
                {chatHistory.map((msg, index) => {
                  const isLongText = msg.text.length > 200; // Define isLongText inside the map function
                  const truncatedText = isLongText ? msg.text.slice(0, 200) + '...' : msg.text;

                  return (
                    <div
                      key={index}
                      className={`flex items-start space-x-2 mb-2 ${msg.sender === botName ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`
                          ${styles.speechBubble} 
                          ${msg.sender === botName ? styles.botBubble : styles.userBubble}
                          ${msg.isFeedback ? styles.feedbackBubble : ""}
                        `}
                        style={
                          msg.sender === botName
                            ? {
                                "--bubble-color": defaultBotBubbleColor,
                                borderColor: defaultBotBubbleColor,
                              }
                            : !msg.isFeedback
                            ? {
                                "--bubble-color": pastelColor,
                                borderColor: pastelColor,
                              }
                            : undefined
                        }
                      >
                        {msg.isThinking || msg.isTyping ? (
                          <span style={{ fontSize: "1rem", display: "flex", alignItems: "center" }}>
                            <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.text) }} />
                            <span className={styles.kaomoji}>
                              {msg.isThinking && Array.isArray(thinking_response_trailer)
                                ? thinking_response_trailer[trailerIndex]
                                : msg.isTyping && Array.isArray(typing_response_trailer)
                                ? typing_response_trailer[trailerIndex]
                                : ""}
                            </span>
                          </span>
                        ) : msg.text.includes("<img") ? (
                          <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.text, { ADD_ATTR: ['target', 'rel'] }) }} />
                        ) : (
                        <span>
                          <ReactMarkdown
                            components={{
                              a: ({ node, ...props }) => (
                                <a {...props} target="_blank" rel="noopener noreferrer" />
                              ),
                            }}
                          >
                            {msg.isFeedback ? `📩 ${msg.text}` : msg.text}
                          </ReactMarkdown>
                        </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                  <div ref={chatEndRef} />
                </>
              )}
            </div>

            <div className={styles.inputWrapper}>
              <div className={styles.inputContainer}>
                <div className={`${styles.exampleQuestions} text-sm`}>
                    <ExampleQuestions questions={exampleQuestions} />
                </div>
                <div className="relative w-full flex flex-col">
                <textarea
                  id="messageInput"
                  value={message}
                  rows="2"
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && message.trim() !== "") {
                      e.preventDefault();
                      feedbackMode ? handleFeedbackSubmit() : handleSendMessage();
                    }
                  }}
                  placeholder={feedbackMode ? feedbackInput_placeholder : chatInput_placeholder}
                  className={`${styles.textarea} ${
                    feedbackMode ? "shadow-md shadow-gray-300 border-gray-300" : "shadow-none"
                  }`}
                  style={{ paddingRight: "3rem" }} // add padding to prevent typing running into the "x"
                />
                {message && (
                <button
                  type="button"
                  onClick={handleClear}
                  aria-label="Clear input"
                  className="absolute right-2 bottom-8 text-white bg-indigo-600 hover:bg-indigo-400 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 text-lg leading-normal font-semibold"
                >
                  <svg width="11" height="11" viewBox="0 0 11 11" stroke="white">
                    <line x1="1" y1="1" x2="11" y2="11" strokeWidth="2"/>
                    <line x1="11" y1="1" x2="1" y2="11" strokeWidth="2"/>
                  </svg>
                </button>
                )}
                <div className="w-28 h-6 bg-gray-400 rounded-full flex items-center relative text-sm font-medium shadow-inner">
                  {/* Slider Knob */}
                <div
                  className="absolute inset-[2px] rounded-full border border-gray-400 transition-transform duration-300"
                  style={{
                    width: "calc(50% - 3px)", // Slightly smaller than 50% to avoid overlap
                    height: "calc(100% - 4px)", // To match inset
                    backgroundColor: !feedbackMode ? pastelColor : "white", // ✅ Only when Chat is active
                    transform: feedbackMode
                      ? "translateX(calc(100% + 2px))"
                      : "translateX(0)",
                  }}
                />

                  {/* Chat Option */}
                  <div
                    onClick={() => setFeedbackMode(false)}
                    className={`inset-[2px] w-1/2 rounded-full text-center cursor-pointer z-10`}
                    title={`Chat with ${botName}`}
                  >
                    💬
                  </div>

                  {/* Contact Us Option */}
                  <div
                    onClick={() => setFeedbackMode(true)}
                    className={`inset-[2px] w-1/2 rounded-full text-center cursor-pointer z-10`}
                    title={feedbackButton_Tooltip}
                  >
                    📩
                  </div>
                </div>        
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Chatbot;