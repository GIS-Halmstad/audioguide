import React from "react";

import AudioguideCard from "./AudioGuideCard";
import { useStore } from "framework7-react";

function TabListViewContent() {
  const filteredFeatures = useStore("filteredFeatures");

  return (
    <div className="cards-grid">
      {/* Render a list (or grid, depending on screen size) of Expandable Cards */}
      {filteredFeatures
        .filter((f) => f.get("length")) // Only line features will have the "length" property
        .map((f, i) => (
          <AudioguideCard feature={f} key={i} />
        ))}
    </div>
  );
}

export default TabListViewContent;
