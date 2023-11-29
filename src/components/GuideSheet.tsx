import React, { useState } from "react";

import {
  f7,
  Block,
  BlockTitle,
  Sheet,
  Button,
  useStore,
  Toolbar,
  Link,
} from "framework7-react";

import { deactivateGuide } from "../js/olMap";

import GuideSheetPointView from "./GuideSheetPointView";

function GuideSheet() {
  const activeGuideObject = useStore("activeGuideObject");
  const activeStopNumber = useStore("activeStopNumber");

  return (
    activeGuideObject !== null && (
      <Sheet
        // className="activeGuide"
        opened={activeGuideObject !== null}
        style={{ height: "auto" }}
        onSheetClosed={() => {
          // When the Sheet has _finished_ closing, let's
          // inform the OL Map that it should clear its
          // selected features too.
          deactivateGuide();
        }}
      >
        <>
          <Toolbar>
            <div className="left"></div>
            <div className="right">
              <Link
                onClick={() => {
                  f7.dialog.confirm("Vill du verkligen avsluta guiden?", () => {
                    // On OK
                    f7.sheet.close();
                  });
                }}
              >
                Avsluta guiden
              </Link>
            </div>
          </Toolbar>

          <GuideSheetPointView
            activeGuideObject={activeGuideObject}
            activeStopNumber={activeStopNumber}
          />
        </>
      </Sheet>
    )
  );
}

export default GuideSheet;
