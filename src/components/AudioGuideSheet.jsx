import React from "react";

// import { getAssets } from "../js/getAssets.js";
import { f7, Block, BlockTitle, PageContent, Sheet } from "framework7-react";

function AudioGuideSheet({ f = [] }) {
  const feature = f[0];
  // const images = getAssets(feature);
  // console.log("images: ", images);
  return (
    <Sheet
      className="sheet-swipe-to-close"
      style={{ height: "auto" }}
      swipeToClose
      opened={feature !== undefined}
      onSheetClose={() => {
        // Let's call this to inform the OL Map that it should clear its
        // selected features too.
        f7.emit("olFeatureSelected", []);
      }}
    >
      <div className="swipe-handler"></div>

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
