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
        // Was anything else already selected when this got selected?
        // …let's tell the component about it.
        setSelectedFeature(f[0]);
        // Also, let's tell the Sheet to open, if it isn't already opened.
        // Why not just take a look at selectedFeature? Because
        // depending on that would mean that unsetting the
        // value also collapses the Sheet immediately. This leads
        // to a nasty disappearing, rather than the nice hide
        // animation. So, let's keep the children so and only hide
        // the Sheet.
        f7.sheet.get()?.opened !== true && setSheetVisible(true);
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

  const getSheetRealHeight = (s: Sheet): number => {
    const { opened } = s;

    // If the Sheet is closed, we know that element's height is 0.
    if (opened === false) {
      return 0;
    }

    // Else, let's find out if the Sheet is partly or completely opened.
    const partlyOpened = Array.from(s.el.classList).includes(
      "modal-in-swipe-step"
    );

    // If the Sheet is partly opened, we want to get the height of its
    // first child only (which is the element that holds the first step).
    // But if the Sheet is completely opened, we want the height of the
    // parent element, which contains both steps.
    const height = partlyOpened
      ? s.el.firstElementChild.firstElementChild.getBoundingClientRect().height
      : s.el.firstElementChild.getBoundingClientRect().height;
    return height;
  };

  const adjustForHeight = (height: number) => {
    f7.emit("adjustForHeight", Math.trunc(height));
  };

  return (
    <Sheet
      className="preview-sheet"
      style={{ height: "auto", maxHeight: "90vh" }}
      swipeToClose
      swipeToStep
      backdrop={false} // To allow for map navigation
      opened={sheetVisible}
      onSheetOpened={(s: Sheet) => adjustForHeight(getSheetRealHeight(s))}
      onSheetStepOpen={(s: Sheet) => adjustForHeight(getSheetRealHeight(s))}
      onSheetStepClose={(s: Sheet) => adjustForHeight(getSheetRealHeight(s))}
      onSheetClosed={(s: Sheet) => {
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
