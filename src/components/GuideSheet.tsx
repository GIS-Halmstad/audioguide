import React, { useState } from "react";

import {
  f7,
  Block,
  BlockTitle,
  Sheet,
  Button,
  useStore,
} from "framework7-react";

import { activateGuide } from "../js/olMap";

function GuideSheet() {
  const activeGuideId = useStore("activeGuideId");

  return (
    <Sheet
      // className="activeGuide"

      opened={activeGuideId !== null}
      style={{ height: "auto" }}
      onSheetClosed={() => {
        // When the Sheet has _finished_ closing, let's
        // inform the OL Map that it should clear its
        // selected features too.
        f7.emit("setActiveGuideId", null);
      }}
    >
      <>
        <div className="swipe-handler"></div>

        <div className="page-content">
          <Block>Hello</Block>
        </div>
      </>
    </Sheet>
  );
}

export default GuideSheet;
