import { Feature } from "ol";
import { StyleObject } from "../types/types";

import { f7 } from "framework7-react";
import { updateFeaturesInMap } from "./openlayers/olMap";
import { copyToClipboard } from "./utils";

import {
  DEFAULT_STROKE_COLOR,
  STROKE_WIDTH,
  DEFAULT_FILL_COLOR,
  DEFAULT_ON_FILL_COLOR,
  POINT_CIRCLE_RADIUS,
} from "./constants";

/**
 * Function to handle showing all guides. The task that we must complete in order
 * to show all guides include deselecting features in the OL map, updating the store's
 * filtered categories, deactivating the active guide, updating the map view,
 * showing a specific tab, and closing the left panel.
 */
export const handleShowAllGuides = async (): Promise<void> => {
  // Tell OL to deselect any features
  f7.emit("olFeatureSelected", []);

  // Tell the Store to select all categories if they're not already selected.
  // This may seem unnecessary, but in fact it eliminates one unneeded render.
  if (
    JSON.stringify(f7.store.state.allCategories) !==
    JSON.stringify(f7.store.state.filteredCategories)
  ) {
    await f7.store.dispatch(
      "setFilteredCategories",
      f7.store.state.allCategories
    );
  }

  // Ensure that no guide remains active
  f7.store.dispatch("deactivateGuide");

  // Tell OL to update the map view
  updateFeaturesInMap();

  // Ensure we go to the List view…
  f7.tab.show("#tab-list");

  // …and that it's scrolled up all the way to the top…
  const tabList = document.getElementById("tab-list");
  if (tabList?.scrollTop) {
    tabList.scrollTop = 0;
  }

  // …and that we close the panel.
  f7.panel.close("left");
};

/**
 * Handles copying the link to a specific guide.
 * @param guideId The ID of the guide.
 * @param stopNumber The stop number of the guide.
 * @returns void
 */
export const handleCopyLinkToGuide = (
  guideId?: number,
  stopNumber?: number,
  customParamsString: string = ""
): void => {
  // Remove any possibly existing hash params and grab the first part.
  const hrefWithoutHash: string = window.location.href.split("#")[0];

  // Find out if there's a guideId and add it to the link if so.
  const guideIdString: string = guideId ? `g=${guideId}` : "";

  // If there's a guideId, find out if there's a stopNumber and add it to the link if so.
  const stopNumberString: string =
    guideId && stopNumber ? `&p=${stopNumber}` : "";

  // Construct a string from the above. If there's a guide and stop, as well
  // as a custom string, let's make sure to put an ampersand in between. Else,
  // don't put any ampersand in the string.
  const paramsString =
    guideIdString +
    stopNumberString +
    (customParamsString.length > 0
      ? ((guideIdString + stopNumberString).length > 0 ? "&" : "") +
        customParamsString
      : "");

  // Put it all together, put a hash in front of params, if they exist, else don't.
  copyToClipboard(
    paramsString.length > 0
      ? hrefWithoutHash + "#" + paramsString
      : hrefWithoutHash,
    f7.dialog.alert
  );
};

/**
 * Handles showing the guide in the map.
 *
 * @param {Feature} feature - The feature to be selected in the map.
 * @param {number} delay - The delay time in milliseconds. Defaults to 0.
 * @return {Promise<void>} - A Promise that resolves when the function is complete.
 */
export const handleShowGuideInMap = async (
  feature: Feature,
  delay: number = 0
): Promise<void> => {
  // If there's a delay, let's to let the Expandable Card animation happen.
  delay !== 0 && (await new Promise((resolve) => setTimeout(resolve, delay)));

  // Then, switch back to map tab.
  f7.tab.show("#tab-map");

  // Finally, tell OL to select the provided feature and ensure we
  // wait 1000 ms before running the animation. Otherwise,
  // there's a weird problem resulting in the map zooming
  // out way too far.
  f7.emit("olFeatureSelected", [feature], 600);
};

const _defaultStyle = {
  // Takes effect only for points
  fillColor: DEFAULT_FILL_COLOR,
  circleRadius: POINT_CIRCLE_RADIUS,

  // Affects both points and lines
  strokeColor: DEFAULT_STROKE_COLOR,
  strokeWidth: STROKE_WIDTH,
  onFillColor: DEFAULT_ON_FILL_COLOR,
};

/**
 * Helper: Tries to return a JSON style object from whatever it gets,
 * (either a string or an object). Returns an empty object if parsing fails
 * or there's nothing to parse.
 */
const _tryParseStyleFromDB = (
  styleAsJson: string | JSON | undefined | null
) => {
  try {
    if (styleAsJson === undefined || styleAsJson === null) {
      return {};
    } else if (typeof styleAsJson === "string") {
      // If layer was read via WFS, the style attribute is a JSON string,
      // as WFS doesn't support the JSON datatype (even though the
      // column is a JSONB in PG). Let's parse it.
      return JSON.parse(styleAsJson) || {};
    } else if (typeof styleAsJson === "object") {
      // If layer comes from GeoJSON, the style attribute already
      // is in the JSON format. Let's return as-is.
      return styleAsJson;
    }
  } catch (error) {
    return {};
  }
};

/**
 * Parses the style of a feature.
 *
 * @param {Feature} feature - The feature to parse the style from.
 * @returns {StyleObject} The parsed style object.
 */
export const parseStyle = (feature: Feature): StyleObject => {
  const parsedParentStyle = _tryParseStyleFromDB(feature.get("parentStyle"));
  const parsedStyle = _tryParseStyleFromDB(feature.get("style"));
  const mergedStyle = {
    ..._defaultStyle,
    ...parsedParentStyle, // Will be {} on line features, but it's fine to spread `...{}`
    ...parsedStyle,
  };
  return mergedStyle;
};
