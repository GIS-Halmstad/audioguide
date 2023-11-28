import React, { useEffect, useState } from "react";

import { f7, Sheet } from "framework7-react";

import GuidePreviewFeatureContent from "./GuidePreviewFeatureContent";

function GuidePreviewSheet() {
  const [selectedFeature, setSelectedFeature] = useState([]);

  useEffect(() => {
    console.log("USEEFFECT subscribe");
    f7.on("olFeatureSelected", (f) => {
      // This will initiate opening/closing the Sheet, depending on value of f.
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
        // When the Sheet has _finished_ closing, let's check if there's still a selected feature.
        // If so, it means that the sheet close was initiate by the user, and we must still
        // inform the OL Map that it should clear its  selected feature too.
        // Note that IF there is no selected feature at this state, we don't want to emit the event.
        // This can be the case if user de-selects the feature in map. In that event, the feature get's
        // de-selected here too and the sheet closing is initiated by the fact that there's no
        // feature selected. This means that there's no need to emit the unselect event.
        selectedFeature.length !== 0 && f7.emit("olFeatureSelected", []);
      }}
    >
      {selectedFeature.length !== 0 && (
        <GuidePreviewFeatureContent f={selectedFeature[0]} />
      )}
    </Sheet>
  );
}

export default GuidePreviewSheet;
