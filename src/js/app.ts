// Import React and ReactDOM
import React from "react";
import { createRoot } from "react-dom/client";

// Import Framework7
import Framework7, { getDevice } from "framework7/lite/bundle";

// Import Framework7-React Plugin
import Framework7React from "framework7-react";

// Import Framework7 Styles
import "framework7/css/bundle";

// Import CSS for flag icons, used in language switcher
import "flag-icons/css/flag-icons.min.css";

// Import Icons and App Custom Styles
import "../css/icons.css";
import "../css/app.css";

// Import translations
import { translateLinesPointsAndCategories } from "./i18n";

// Import App Component
import store from "./store";
import App from "../components/App";
import ErrorApp from "../components/ErrorApp";
import UnsupportedOsApp from "../components/UnsupportedOsApp";
import fetchFromService from "./fetchFromService";

import washMapConfig from "./washMapConfig";
import { info } from "../js/logger";

// Let's see if the client meets our system requirements. It's a bit hard
// to guess which Android version are truly supported, so we will ignore
// that part. But for iOS, it's clear that the WebP image format requires
// iOS 14, while top-level awaits require iOS 15, so the latter sets our requirements.
const { os, osVersion } = getDevice();
const osVersionNumber = parseFloat(osVersion);
const unsupportedOs =
  !Number.isNaN(osVersionNumber) && os === "ios" && osVersionNumber < 15;

if (unsupportedOs) {
  // Let's put this render into a separate app flow – there's no need
  // to do the other things we'd in the normal app flow, since we won't
  // be able to render the App component anyway.

  // Init the F7 App and the React plugin
  Framework7.use(Framework7React);

  // Render the Unsupported OS App
  const root = createRoot(document.getElementById("app") as HTMLElement);
  root.render(React.createElement(UnsupportedOsApp));
} else {
  // This is the normal app flow.

  // N.B. The second argument is empty because… type definition for dispatch().
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
      info("[app.ts] Map config loaded:", washedMapConfig);
      // Let's save the map config to the store for later use.
      store.dispatch("setMapConfig", washedMapConfig);

      // Grab line features from WFSs and save to store
      const unmodifiedAllLines = await fetchFromService("line");
      store.dispatch("setUnmodifiedAllLines", unmodifiedAllLines);

      // Grab point features too
      const unmodifiedAllPoints = await fetchFromService("point");

      // Each point belongs to a line and that line may have a `style`
      // property. Let's try to find the parent line and add its style
      // to the `parentStyle` property of the point feature.
      const unmodifiedAllPointsWithStyleFromParentLine =
        unmodifiedAllPoints.map((f) => {
          const parentLine = unmodifiedAllLines.find(
            (l) => l.get("guideId") === f.get("guideId")
          );
          if (parentLine) {
            // Set the parent style on the point feature by copying line's style.
            // The third parameter ensures OL doesn't notify any observers - there's no need here.
            f.set("parentStyle", parentLine.get("style") || null, true);
          }
          return f;
        });
      store.dispatch(
        "setUnmodifiedAllPoints",
        unmodifiedAllPointsWithStyleFromParentLine
      );

      // Now that we have the unmodified lines and points, we must translate them.
      // Usually, this is handled by the i18n.on("languageChanged") event, but now,
      // on initial app load, it won't trigger. So we do it here.
      // This step is important, as it will populate Store's `allLines` and
      // `allPoints` as well as ensure that the Features contain all the required properties
      // of `title`, `text`, `length` and `highlightLabel` with translated values.
      translateLinesPointsAndCategories();
    } catch (error) {
      store.dispatch("setLoadingError", error);
    }
  }

  // No matter what, let's setup the F7 App and the React plugin.
  Framework7.use(Framework7React);

  // Depending on whether we have an error or not, render the App or the ErrorApp.
  const root = createRoot(document.getElementById("app") as HTMLElement);
  root.render(
    React.createElement(store.state.loadingError === null ? App : ErrorApp)
  );
}
// Always remove the loading class, so the React app underneath is shown.
document.body.classList.remove("loading");
