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
import "../css/app.css";

// Import App Component
import App from "../components/app.jsx";
import store from "./store.js";
import fetchFromService from "./fetchFromService.js";

try {
  // Fetch appConfig which contains some necessary settings,
  // such as the base URL for our API.
  const appConfigResponse = await fetch("appConfig.json");
  const appConfig = await appConfigResponse.json();
  store.dispatch("setAppConfig", appConfig);

  // Fetch the map config, which contains layers
  // definitions and is required before we can create
  // the OpenLayers map and add layers.
  const mapConfigResponse = await fetch(
    `${store.state.appConfig.mapServiceBase}/config/${store.state.appConfig.mapName}`
  );
  const mapConfig = await mapConfigResponse.json();
  // Let's save the map config to the store for later use.
  store.dispatch("setMapConfig", mapConfig);

  // Grab features from WFSs and save to store
  const allLines = await fetchFromService("line");
  store.dispatch("setAllLines", allLines);

  const allPoints = await fetchFromService("point");
  store.dispatch("setAllPoints", allPoints);

  // Extract available categories from all line features.
  // Keep only unique values.
  const categories = Array.from(
    new Set(allLines.flatMap((f) => f.get("categories").split(",")))
  );
  store.dispatch("setAllCategories", categories);
} catch (error) {
  store.dispatch("setLoadingError", true);
  console.error(error);
}

// Init F7 React Plugin
console.log("Init F7 React Plugin");
Framework7.use(Framework7React);

// Mount React App
const root = createRoot(document.getElementById("app"));
root.render(React.createElement(App));
