import React from "react";

import AudioGuideCard from "../components/AudioGuideCard";
import { useStore } from "framework7-react";

function TabListViewContent() {
  const filteredFeatures = useStore("filteredFeatures");

  return filteredFeatures
    .filter((f) => f.get("length")) // Only line features will have the "length" property
    .map((c, i) => <AudioGuideCard c={c} key={i} />);
}

export default TabListViewContent;
