import { f7 } from "framework7-react";
import {
  DEFAULT_STROKE_COLOR,
  STROKE_WIDTH,
  DEFAULT_FILL_COLOR,
  POINT_CIRCLE_RADIUS,
} from "../js/constants";

type StyleObject = {
  strokeColor?: string;
  strokeWidth?: number;
  fillColor?: string;
  circleRadius?: number;
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

/**
 * Parses the style of a feature.
 *
 * @param {ol.Feature} feature - The feature to parse the style from.
 * @returns {StyleObject} The parsed style object.
 */
export const parseStyle = (feature: ol.Feature): StyleObject => {
  return (
    JSON.parse(feature.get("style")) || {
      strokeColor: DEFAULT_STROKE_COLOR,
      strokeWidth: STROKE_WIDTH,
      fillColor: DEFAULT_FILL_COLOR,
      circleRadius: POINT_CIRCLE_RADIUS,
    }
  );
};
