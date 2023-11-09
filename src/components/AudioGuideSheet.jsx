import React from "react";

// import { getAssets } from "../js/getAssets.js";
import { Block, BlockTitle, PageContent, Sheet } from "framework7-react";

function AudioGuideSheet({ f = [] }) {
  const feature = f[0];
  // const images = getAssets(feature);
  // console.log("images: ", images);
  return (
    <Sheet
      className="demo-sheet-swipe-to-close"
      style={{ height: "auto" }}
      // swipeToClose
      push
      opened={feature !== undefined}
    >
      {/* <div className="swipe-handler"></div> */}

      <PageContent>
        <BlockTitle large>{feature?.get("title")}</BlockTitle>
        <Block>
          <p>{feature?.get("text")}</p>
        </Block>
      </PageContent>
    </Sheet>
  );
}

export default AudioGuideSheet;
