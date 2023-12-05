import React from "react";

import AudioguideCard from "./AudioguideCard";
import { useStore } from "framework7-react";

function TabListViewContent() {
  const filteredFeatures = useStore("filteredFeatures");

  return filteredFeatures
    .filter((f) => f.get("length")) // Only line features will have the "length" property
    .map((c, i) => <AudioguideCard c={c} key={i} />);
}

export default TabListViewContent;
