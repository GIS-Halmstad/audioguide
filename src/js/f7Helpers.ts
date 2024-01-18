import { f7 } from "framework7-react";

export const handleShowGuideInMap = async (feature) => {
  // Wait a while to let the Expandable Card animation happen,
  // then, switch back to map tab.
  setTimeout(() => {
    f7.tab.show("#tab-map");

    // Tell OL to select the provided feature and ensure we
    // wait 1000 ms before running the animation. Otherwise,
    // there's a weird problem resulting in the map zooming
    // out way too far.
    f7.emit("olFeatureSelected", [feature], 1000);
  }, 600);
};
