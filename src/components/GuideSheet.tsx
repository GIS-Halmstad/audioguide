import React from "react";

import { Sheet, useStore } from "framework7-react";

import { deactivateGuide } from "../js/olMap";

import GuideSheetContent from "./GuideSheetContent";

function GuideSheet() {
  const activeGuideObject = useStore("activeGuideObject");
  const activeStopNumber = useStore("activeStopNumber");

  return (
    <Sheet
      className="active-guide-sheet"
      style={{ height: "auto", maxHeight: "90vh" }}
      swipeToStep
      opened={activeGuideObject !== null}
      onSheetClosed={() => {
        // When the Sheet has _finished_ closing, let's
        // inform the OL Map that it should clear its
        // selected features too.
        deactivateGuide();
      }}
    >
      {activeGuideObject !== null && (
        <GuideSheetContent
          activeGuideObject={activeGuideObject}
          activeStopNumber={activeStopNumber}
        />
      )}
    </Sheet>
  );
}

export default GuideSheet;
