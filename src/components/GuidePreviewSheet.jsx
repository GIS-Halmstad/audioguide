import React, { useEffect, useState } from "react";

import { f7, Sheet } from "framework7-react";

import GuidePreviewFeatureContent from "./GuidePreviewFeatureContent";

function GuidePreviewSheet() {
  const [selectedFeature, setSelectedFeature] = useState([]);

  useEffect(() => {
    console.log("USEEFFECT subscribe");
    f7.on("olFeatureSelected", (f) => {
      console.log("Got selected feature", f);
      setSelectedFeature(f);
    });

    return () => {
      console.log("USEEFFECT unsubscribe");
      f7.off("olFeatureSelected");
    };
  }, [f7, setSelectedFeature]);

  return (
    <Sheet
      className="preview"
      swipeToClose
      opened={selectedFeature.length !== 0}
      style={{ height: "auto" }}
      onSheetClosed={() => {
        // When the Sheet has _finished_ closing, let's
        // inform the OL Map that it should clear its
        // selected features too.
        f7.emit("olFeatureSelected", []);
      }}
    >
      {selectedFeature.length !== 0 && (
        <GuidePreviewFeatureContent f={selectedFeature[0]} />
      )}
    </Sheet>
  );
}

export default GuidePreviewSheet;
