// Import React and ReactDOM
import React from "react";
import { createRoot } from "react-dom/client";

// Import Framework7
import Framework7 from "framework7/lite-bundle";

// Import Framework7-React Plugin
import Framework7React from "framework7-react";

// Import Framework7 Styles
import "framework7/css/bundle";

// Import Icons and App Custom Styles
import "../css/icons.css";
import "../css/app.css";

// Import App Component
import App from "../components/app.jsx";
import store from "./store.js";

// Fetch appConfig which contains some necessary settings,
// such as the base URL for our API.
const response = await fetch("appConfig.json");
const appConfig = await response.json();
// Save in store for later use.
store.dispatch("setAppConfig", appConfig);

// Init F7 React Plugin
Framework7.use(Framework7React);

// Mount React App
const root = createRoot(document.getElementById("app"));
root.render(React.createElement(App));
