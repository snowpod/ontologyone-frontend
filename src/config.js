// config.js

const API_BASE_URL = {
  hr_demo: process.env.REACT_APP_HR_DEMO_API_URL || "http://127.0.0.1:8000",
  chatbot: process.env.REACT_APP_CHATBOT_API_URL || "http://127.0.0.1:8001",
};

const APP_NAME = "OntologyOne";
const BOT_NAME = "Harper";

const APP_QUESTIONS = [
  "Where can we find GlobalTech's offices?",
  "How many staff do we have in each of our offices?",
  "Who works in GlobalTech's Singapore office?",
  "Who are our developers, their offices and salaries in USD?",
  "Who are 沈雕's superiors? Give me their names and designations.",
  "Is Brenda Kang in sales?",
  "What are the job positions with GlobalTech's IT department?",
  "我们的中国员工是谁？他们的姓名和职称（英文和中文）是什么？",
  "Wer sind unsere deutschen Mitarbeiter? Ihre Namen, Berufsbezeichnungen (auf Deutsch und Englisch), Gehälter (in Euro und USD) sowie den verwendeten Wechselkurs auf."
];

const APP_FEEDBACK = {
  header: (appName) => `Let the dev team know what you think about ${appName}.`,
  slider_marker: {
    positive: "💖 Super like!",
    negative: "👎 Not fond of it",
  },
  reply_match: (rating, hasComment) => hasComment
    ? `Thanks for your comments and the ${rating}/5 rating!`
    : `Got it, you rated us ${rating}/5. Thanks a bunch!`,
  reply_mismatch: "Looks like your feedback relates to a different face. It's okay, we'll use both to improve",
  reply_reward: (emoji) => ` — have a ${emoji} on us!`,
  reward: {
    positive: {
      mealtime: ["🍱", "🍕", "🍜", "🥗", "🍔"],
      snack: ["🍪", "🍰", "🍩", "🍫", "🍦"],
    },
    neutral: ["🍙", "🍎", "🍌", "🥪", "🍲"],
    negative: ["🍬", "🍭", "🍮", "🧋", "🧃"],
  },
  easter_egg: { 
    reply: (emoji, fortune) => `You found a fortune cookie ${emoji} — “${fortune}”`,
    emoji: "🥠",
    fortune: [
      "You will ship something great this week.",
      "A happy user is in your near future.",
      "Your curiosity will lead to something wonderful.",
      "Your kindness will echo in unexpected places.",
      "A tiny moment will become your favorite memory.",
      "A spark of inspiration is about to hit you.",
      "An idea you've been ignoring might be golden.",
      "A nap may solve your biggest problem.",
      "A chill moment is on the horizon. You deserve it.",
      "Data and 🍩s. You get both."
    ],
  },
};

const APP_STARTUP = {
  max_retries:  5,
  retry_delay_ms: 3000
};

const CHATBOT_STARTUP = {
  max_retries:  8,
  retry_delay_ms: 2000
};

const CHATBOT_UI = {
  chatBubbleColor: {
    user: "#EBEBEE",  // White
    bot: "#e0e7ff"  // light indigo
  },
};

const CHATBOT_QUESTIONS = (appName) => [
  `What is ${appName} about?`,
  "What kind of technology is used?",
  "What is an ontology?",
  "Will an RDBMS not work as well?",
];

const CHATBOT_INTERACTIONS = {
  opening_script: {
    avatar: "<p class='text-xl'><span class='bg-orange-100'>|˶˙ᵕ˙ )</span><span class='inline-block animateWave origin-bottom-left'>ﾉﾞ</span></p>",
    text: (avatar, appName, botName) => `
    ${avatar} Hi there! I'm <strong>${botName}</strong>, team ${appName}'s Technical Writer and your friendly guide to the app.<br /><br />
    I'm here to help you explore everything ${appName} has to offer — from the power of ontologies to the cool tech behind them, and why it all matters. <br /><br />
    But before we dive in, let's get to know each other a little!<br/><br/>`,
    username_label: "What's your name?",
    favorite_color_label: "And just for fun — what's your favorite color?",
  },
  initial_response: (userName) =>
    `Hi${userName ? ` ${userName.trim()}` : ""}! Give me a moment to get everything started.  \nJust so you know — since I run on free-tier services, replies might take a little longer. Thanks for your patience!`,
  loading_placeholder: "Please wait for Harper to be ready...",
  chatInput_placeholder: "Ask something... (Press Enter to send)",
  ready_response: "I'm all set! Ask me anything.",
  thinking_response: "Hmm  \u00a0",
  thinking_response_trailer: ["(๑-₃-)", "(ᵕ-₃-)", "(ᵕ•₃-)", "(ᵕ•₃•)", "( •᎑•)"],
  typing_response: "Typing \u00a0('・ω)<span class='animateType'>ヘ</span>＿/ \u00a0",
  typing_response_trailer: ["", "•-", "•- -•", "•- -• •••"],
  typing_response_trailer1: ["", "•-•", "•-• •", "•-• • •--•", "•-• • •--• •-••", "•-• • •--• •-•• -•--"],
};

const CHATBOT_FEEDBACK = {
  button_tooltip: "Contact the team: Comments or Message",
  chatInput_placeholder: "Ok, let me note this down for the team... (Press Enter to submit)",
  reply: "Can! On behalf of the team, thanks for helping us make things better! 💐",
};

export default {
  PROCESS_QUERY: `${API_BASE_URL.hr_demo}/process_query`,
  SUBMIT_FEEDBACK: `${API_BASE_URL.hr_demo}/submit_feedback`,
  START_CHAT: `${API_BASE_URL.chatbot}/chat/start`,
  CHAT: `${API_BASE_URL.chatbot}/chat`,
  CHAT_FEEDBACK: `${API_BASE_URL.chatbot}/submit_feedback`,
  CHAT_HISTORY: `${API_BASE_URL.chatbot}/chat_history`,
  APP_NAME,
  BOT_NAME,
  APP_QUESTIONS,
  APP_FEEDBACK,
  APP_STARTUP,
  CHATBOT_STARTUP,
  CHATBOT_UI,
  CHATBOT_QUESTIONS,
  CHATBOT_INTERACTIONS,
  CHATBOT_FEEDBACK
};