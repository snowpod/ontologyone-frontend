import React, { useState, useEffect } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css"; 
import "./index.css";

import API from "./config.js";
import Hr_demo from "./Hr_demo.js";
import Chatbot from "./Chatbot.js";

import "./Main.css";

const MainApp = () => {
  const appName = API.APP_NAME || "OntologyOne";
  const [tabIndex, setTabIndex] = useState(0); // default to first tab

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab") || window.location.hash?.substring(1); // fallback to #chatbot

    if (tabParam === "chatbot") {
      setTabIndex(1); // second tab
    } else if (tabParam === "app") {
      setTabIndex(0);
    }
  }, []);

  return (
    <div className="app">
      <Tabs selectedIndex={tabIndex} onSelect={(index) => setTabIndex(index)}>
        <TabList className="tabsContainer" style={{ marginTop: '10px' }}>
          <Tab className="tabHeader hrDemoTab">
              <span className="ghostText">{appName}</span>
              <span className="realText">{appName}</span>
          </Tab>
          <Tab className="tabHeader chatbotTab">
              <span className="ghostText">Ask Harper About {appName}</span>
              <span className="realText">Ask Harper About {appName}</span>
          </Tab>
        </TabList>
        <TabPanel>
          <Hr_demo />
        </TabPanel>
        <TabPanel>
          <Chatbot />
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default MainApp;