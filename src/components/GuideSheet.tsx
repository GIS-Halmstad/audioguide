import React from "react";

import { Sheet, useStore } from "framework7-react";

import { deactivateGuide } from "../js/openlayers/olMap";

import GuideSheetContent from "./GuideSheetContent";

function GuideSheet() {
  const activeGuideObject = useStore("activeGuideObject");

  return (
    <Sheet
      className="active-guide-sheet"
      style={{ height: "auto", maxHeight: "100vh", top: "0px" }}
      backdrop={false} // To allow for map navigation
      closeByOutsideClick={false} // To prevent the Sheet from closing when map is clicked
      swipeToStep
      breakpoints={[0.24, 0.42, 0.55, 0.75, 1.0]}
      opened={activeGuideObject !== null}
      onSheetClosed={() => {
        // When the Sheet has _finished_ closing, let's
        // inform the OL Map that it should clear its
        // selected features too.
        deactivateGuide();
      }}
      onSheetOpen={(s) => {
        // When the Sheet has opened for the first time, let's start
        // at this specific breakpoint.
        s?.setBreakpoint(0.55);
      }}
      onSheetBreakpoint={(s, i) => {
        // When the Sheet's breakpoint changes, we need to
        // calculate the new height of the Sheet and determine
        // how much space can be used for the flexible height scrolling content.
        const currentBreakpoint = s.params.breakpoints.indexOf(i);
        if (currentBreakpoint > 1) {
          // Find out the real current height of our Sheet
          const sheetBoundingClientRect = s.el.getBoundingClientRect();
          const realSheetHeight =
            sheetBoundingClientRect.height - sheetBoundingClientRect.top;

          // Find out the height of the static content (i.e. top image, title, play buttons)
          const fixedContentHeight = s.el
            .querySelector(".sheet-modal-swipe-step")
            .getBoundingClientRect().height;

          // Subtract the fixed content height from Sheet's total height. The result
          // is what remains as height for the flexible content.
          const flexibleContentMaxHeight = realSheetHeight - fixedContentHeight;

          // Set the maxHeight CSS property on the flexible content, required to make
          // scrolling inside this element work.
          const flexibleContentElement = s.el.querySelector(".page-content");
          flexibleContentElement.style.maxHeight =
            flexibleContentMaxHeight + "px";
        }
      }}
    >
      {activeGuideObject !== null && (
        <GuideSheetContent activeGuideObject={activeGuideObject} />
      )}
    </Sheet>
  );
}

export default GuideSheet;
