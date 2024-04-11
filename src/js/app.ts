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
import store from "./store";
import App from "../components/App";
import ErrorApp from "../components/ErrorApp";
import fetchFromService from "./fetchFromService";

import washMapConfig from "./washMapConfig";
import { preventAndroidBackButton } from "./utils";

preventAndroidBackButton();

// The second argument is empty because… type definition for dispatch().
store.dispatch("trackAnalyticsPageview", {});

// It is possible that we already have an error that occurred when the Store fetched
// the appConfig.json. So let's do a check here. If Store was initiated without an error,
// let's fetch the map config and continue with setting up the app.
if (store.state.loadingError === null) {
  try {
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
      store.state.appConfig.useStaticMapConfig === true
        ? "staticMapConfig.json"
        : `${mapServiceBaseUrl}/config/${store.state.appConfig.mapName}`
    );
    const mapConfig = await mapConfigResponse.json();
    const washedMapConfig = washMapConfig(mapConfig);
    console.log("washedMapConfig: ", washedMapConfig);
    // Let's save the map config to the store for later use.
    store.dispatch("setMapConfig", washedMapConfig);

    // Grab line features from WFSs and save to store
    const allLines = await fetchFromService("line");
    store.dispatch("setAllLines", allLines);

    // Grab point features too
    const allPoints = await fetchFromService("point");

    // Each point belongs to a line and that line may have a `style`
    // property. Let's try to find the parent line and add its style
    // to the `parentStyle` property of the point feature.
    const allPointsWithStyleFromParentLine = allPoints.map((f) => {
      const parentLine = allLines.find(
        (l) => l.get("guideId") === f.get("guideId")
      );
      if (parentLine) {
        // Set the parent style on the point feature by copying line's style.
        // The third parameter ensures OL doesn't notify any observers - there's no need here.
        f.set("parentStyle", parentLine.get("style") || null, true);
      }
      return f;
    });
    store.dispatch("setAllPoints", allPointsWithStyleFromParentLine);

    // Extract available categories from all line features.
    // Keep only unique values.
    const categories = Array.from(
      new Set(allLines.flatMap((f) => f.get("categories").split(",")))
    );
    store.dispatch("setAllCategories", categories);

    // When the Store was initiated, filteredCategories was set to the value
    // of the `c` param in URL. If `c` is empty (i.e. no specific category is
    // pre-selected), we want to check if there are pre-selected categories in
    // map config (and set filteredCategories to those), or else set filtered
    // to all categories.
    if (store.state.filteredCategories.length === 0) {
      // Let's check if there are pre-selected categories in map config
      const preselectedCategories =
        store.state.mapConfig.tools.audioguide.preselectedCategories || [];
      if (preselectedCategories.length > 0) {
        // If there are pre-selected categories, let's ensure that
        // they're valid (i.e. exist among available categories).
        const validPreselectedCategories = preselectedCategories.filter(
          (c: string) => categories.includes(c)
        );

        if (validPreselectedCategories.length > 0) {
          store.dispatch("setFilteredCategories", validPreselectedCategories);
        } else {
          store.dispatch("setFilteredCategories", categories);
        }
      } else {
        store.dispatch("setFilteredCategories", categories);
      }
    }
  } catch (error) {
    store.dispatch("setLoadingError", error);
  }
}

// No matter what, let's setup the F7 App and the React plugin.
console.log("Init F7 React Plugin");
Framework7.use(Framework7React);

// Depending on whether we have an error or not, render the App or the ErrorApp.
const root = createRoot(document.getElementById("app"));
root.render(
  React.createElement(store.state.loadingError === null ? App : ErrorApp)
);

// Always remove the loading class, so the React app underneath is shown.
document.body.classList.remove("loading");
