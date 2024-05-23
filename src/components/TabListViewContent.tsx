import React from "react";
import { useStore } from "framework7-react";

import { Feature } from "ol";

import AudioguideCard from "./AudioGuideCard";
import NoGuidesAvailable from "./NoGuidesAvailable";

function TabListViewContent() {
  const filteredFeatures = useStore("filteredFeatures") as Feature[];

  return filteredFeatures.length > 0 ? (
    <div className="cards-grid">
      {/* Render a list (or grid, depending on screen size) of Expandable Cards */}
      {filteredFeatures
        .filter((f) => f.getGeometry()?.getType() === "LineString") // We only want line features in the list
        .map((f, i) => (
          <AudioguideCard feature={f} key={i} />
        ))}
    </div>
  ) : (
    <NoGuidesAvailable />
  );
}

export default TabListViewContent;
