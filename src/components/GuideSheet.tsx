import React from "react";

import { Sheet, useStore } from "framework7-react";

import { deactivateGuide } from "../js/openlayers/olMap";

import GuideSheetContent from "./GuideSheetContent";

function GuideSheet() {
  const activeGuideObject = useStore("activeGuideObject");

  return (
    <Sheet
      className="active-guide-sheet"
      style={{ height: "auto", maxHeight: "90vh" }}
      backdrop={false} // To allow for map navigation
      closeByOutsideClick={false} // To prevent the Sheet from closing when map is clicked
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
        <GuideSheetContent activeGuideObject={activeGuideObject} />
      )}
    </Sheet>
  );
}

export default GuideSheet;
