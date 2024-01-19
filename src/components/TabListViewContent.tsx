import React from "react";

import AudioguideCard from "./AudioguideCard";
import { Block, useStore } from "framework7-react";

function TabListViewContent() {
  const filteredFeatures = useStore("filteredFeatures");

  return (
    <div className="expandable-cards-grid">
      {/* Render a list (or grid, depending on screen size) of Expandable Cards */}
      {filteredFeatures
        .filter((f) => f.get("length")) // Only line features will have the "length" property
        .map((f, i) => (
          <AudioguideCard feature={f} key={i} />
        ))}
      {/* We must specify a custom backdrop, else the container is used and this
      makes all the cards blur out.  */}
      <div className="card-backdrop custom-backdrop"></div>
    </div>
  );
}

export default TabListViewContent;
