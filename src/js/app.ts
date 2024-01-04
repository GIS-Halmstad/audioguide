// Import React and ReactDOM
import React from "react";
import { createRoot } from "react-dom/client";

// Import Framework7
import Framework7 from "framework7/lite/bundle";

// Import Framework7-React Plugin
import Framework7React from "framework7-react";

// Import Framework7 Styles
import "framework7/css/bundle";

// Import Icons and App Custom Styles
import "../css/icons.css";
import "../css/app.css";

// Import App Component
import App from "../components/App";
import ErrorApp from "../components/ErrorApp";
import store from "./store";
import fetchFromService from "./fetchFromService";

import washMapConfig from "./washMapConfig";

// The second argument is empty because… type definition for dispatch().
store.dispatch("trackAnalyticsPageview", {});

try {
  // Fetch appConfig which contains some necessary settings,
  // such as the base URL for our API.
  const appConfigResponse = await fetch("appConfig.json");
  const appConfig = await appConfigResponse.json();
  store.dispatch("setAppConfig", appConfig);

  // Let's give the user a chance to override the MapServiceBase URL
  const mapServiceBaseUrl =
    localStorage.getItem("overrideMapServiceBaseUrl") ||
    store.state.appConfig.mapServiceBase;
  // Fetch the map config, which contains layers
  // definitions and is required before we can create
  // the OpenLayers map and add layers.
  //
  // Allow for supplying of static map config by setting `useStaticMapConfig` 
  // to `true` in appConfig.json. If it exists, no Hajk backend needs to be
  // running and the application will look for a file named `staticMapConfig.json`.
  const mapConfigResponse = await fetch(
    store.state.appConfig.useStaticMapConfig === true ? "staticMapConfig.json": `${mapServiceBaseUrl}/config/${store.state.appConfig.mapName}`
  );
  const mapConfig = await mapConfigResponse.json();
  const washedMapConfig = washMapConfig(mapConfig);
  console.log("washedMapConfig: ", washedMapConfig);
  // Let's save the map config to the store for later use.
  store.dispatch("setMapConfig", washedMapConfig);

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

  // When the Store was initiated, filteredCategories was set to the value
  // of the `c` param in URL. If `c` is empty (i.e. no specific category is
  // pre-selected), we want all categories to be selected on start.
  if (store.state.filteredCategories.length === 0) {
    store.dispatch("setFilteredCategories", categories);
  }
} catch (error) {
  store.dispatch("setLoadingError", error);
}

// Init F7 React Plugin
console.log("Init F7 React Plugin");
Framework7.use(Framework7React);

// Mount React App
const root = createRoot(document.getElementById("app"));
root.render(
  React.createElement(store.state.loadingError === null ? App : ErrorApp)
);

// Remove the loading class from BODY when we're finished rendering
document.body.classList.remove("loading");
