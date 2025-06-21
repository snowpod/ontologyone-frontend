import React from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css"; 
import "./index.css";  // Keep this to include your global styles

import API from "./config.js";
import Hr_demo from "./Hr_demo.js";
import Chatbot from "./Chatbot.js";

import "./Main.css";

const MainApp = () => {
  const appName = API.APP_NAME || "HR Demo";

  return (
    <div className="app">
      <Tabs>
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