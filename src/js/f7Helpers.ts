import { f7 } from "framework7-react";
import { updateFeaturesInMap } from "./openlayers/olMap";

import {
  DEFAULT_STROKE_COLOR,
  STROKE_WIDTH,
  DEFAULT_FILL_COLOR,
  DEFAULT_ON_FILL_COLOR,
  POINT_CIRCLE_RADIUS,
} from "../js/constants";
import { Feature } from "ol";

type StyleObject = {
  strokeColor?: string;
  strokeWidth?: number;
  fillColor?: string;
  onFillColor?: string;
  circleRadius?: number;
};

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

  // …and that we close the panel.
  f7.panel.close("left");
};

/**
 * Handles showing the guide in the map.
 *
 * @param {ol.Feature} feature - The feature to be selected in the map.
 * @param {number} delay - The delay time in milliseconds. Defaults to 0.
 * @return {Promise<void>} - A Promise that resolves when the function is complete.
 */
export const handleShowGuideInMap = async (
  feature: ol.Feature,
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

const _tryParseStyleFromDB = (styleAsJson: string) => {
  try {
    return JSON.parse(styleAsJson) || {};
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
