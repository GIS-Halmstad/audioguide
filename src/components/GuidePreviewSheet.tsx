import React, { useEffect, useState } from "react";

import { f7, Sheet } from "framework7-react";

import { Feature } from "ol";

import GuidePreviewSheetContent from "./GuidePreviewSheetContent";
import { log, warn } from "../js/logger";

function GuidePreviewSheet() {
  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  useEffect(() => {
    warn("[GuidePreviewSheet.tsx] useEffect subscribe");
    f7.on("olFeatureSelected", (f: Feature[]) => {
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
      log("[GuidePreviewSheet.tsx] useEffect unsubscribe");
      f7.off("olFeatureSelected");
    };
  }, [f7, setSelectedFeature, setSheetVisible]);

  const getSheetRealHeight = (s: typeof Sheet): number => {
    // Find out the real current height of our Sheet
    const sheetBoundingClientRect = s.el.getBoundingClientRect();
    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const realSheetHeight =
      Math.min(sheetBoundingClientRect.bottom, viewportHeight) -
      Math.max(sheetBoundingClientRect.top, 0);

    return realSheetHeight;
  };

  const adjustForHeight = (height: number) => {
    f7.emit("adjustForHeight", Math.trunc(height));
  };

  return (
    <Sheet
      className="preview-sheet"
      style={{ height: "auto", maxHeight: "90vh" }}
      breakpoints={[0.2, 0.75, 1.0]}
      swipeToClose
      backdrop={false} // To allow for map navigation
      opened={sheetVisible}
      onSheetOpen={(s: Sheet) => {
        // When the Sheet has opened for the first time, let's start
        // at this specific breakpoint.
        s?.setBreakpoint(0.75);
      }}
      onSheetBreakpoint={(s: Sheet) => {
        adjustForHeight(getSheetRealHeight(s));
      }}
      onSheetOpened={(s: Sheet) => {
        adjustForHeight(getSheetRealHeight(s));
      }}
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
