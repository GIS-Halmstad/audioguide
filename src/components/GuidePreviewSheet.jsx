import React, { useState } from "react";

import { f7, Block, BlockTitle, Sheet, Button } from "framework7-react";

function FeatureContent({ f }) {
  let pointFeature = null;
  let lineFeature = null;

  if (f.getGeometry().getType() === "Point") {
    pointFeature = f;
    lineFeature = f7.store.state.allLines.find(
      (lf) => lf.get("guideId") === pointFeature.get("guideId")
    );
  } else {
    lineFeature = f;
  }
  console.log(pointFeature?.getProperties(), lineFeature?.getProperties());

  return (
    <>
      <div className="swipe-handler"></div>
      <BlockTitle>{lineFeature.get("title")}</BlockTitle>
      {pointFeature !== null && (
        <Block>{`Stopp ${pointFeature.get("stopNumber")}: ${pointFeature.get(
          "title"
        )}`}</Block>
      )}

      <Block>
        <div className="page-content">
          <p>{lineFeature.get("text")}</p>
          <p>
            Kategorier: {lineFeature.get("categories")?.split(",").join(", ")}
          </p>
          <p>Längd: {lineFeature.get("length")}</p>
        </div>
      </Block>
      <Block>
        <Button fill round large cardClose onClick={() => {}}>
          Starta
        </Button>
      </Block>
    </>
  );
}

function GuidePreviewSheet({ f = [] }) {
  const feature = f[0];

  return (
    <Sheet
      className="preview"
      swipeToClose
      opened={feature !== undefined}
      style={{ height: "auto" }}
      onSheetClosed={() => {
        // When the Sheet has _finished_ closing, let's
        // inform the OL Map that it should clear its
        // selected features too.
        f7.emit("olFeatureSelected", []);
      }}
    >
      {feature !== undefined && <FeatureContent f={feature} />}
    </Sheet>
  );
}

export default GuidePreviewSheet;
