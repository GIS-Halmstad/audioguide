import React, { useEffect, useState } from "react";

import { f7, Sheet } from "framework7-react";

import GuidePreviewSheetContent from "./GuidePreviewSheetContent";

function GuidePreviewSheet() {
  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);

  useEffect(() => {
    console.log("USEEFFECT subscribe");
    f7.on("olFeatureSelected", (f) => {
      // If there's a feature…
      if (f.length > 0) {
        // …let's tell the component about it.
        setSelectedFeature(f[0]);
        // Also, let's tell the Sheet to open.
        // Why not just take a look at selectedFeature? Because
        // depending soly on that would mean that unsetting the
        // value also collapses the Sheet immediately. This leads
        // to a nasty disappearing, rather than the nice hide
        // animation. So, let's keep the children so and only hide
        // the Sheet.
        setSheetVisible(true);
      } else {
        // As stated above, just hide the Sheet - don't remove
        // its children.
        setSheetVisible(false);
      }
    });

    return () => {
      console.log("USEEFFECT unsubscribe");
      f7.off("olFeatureSelected");
    };
  }, [f7, setSelectedFeature, setSheetVisible]);

  return (
    <Sheet
      className="preview-sheet"
      style={{ height: "auto", maxHeight: "90vh" }}
      swipeToClose
      swipeToStep
      backdrop
      opened={sheetVisible}
      onSheetClosed={() => {
        // There is the possibility that the closing was initiated by
        // swiping, rather than clicking inside the Map. In this case,
        // we must inform the map to deselect its selected features.
        // Yes, this will emit even if this was initiated by the Map itself
        // and in that case there's nothing else to de-select (as users sole
        // click interaction has already de-selected all features). So this
        // will run unnecessary in those cases. But it's still better than
        // setting the selectedFeature to [], as that would lead to an ugly
        // collapse of the Sheet. Furthermore, there's no re-render involved,
        // so the cost is negligible.
        f7.emit("olFeatureSelected", []);
      }}
    >
      {selectedFeature !== null && (
        <GuidePreviewSheetContent f={selectedFeature} />
      )}
    </Sheet>
  );
}

export default GuidePreviewSheet;
