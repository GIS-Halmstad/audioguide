import React, { useEffect, useState } from "react";

import { f7, Block, BlockTitle, Sheet, Button } from "framework7-react";

import { activateGuide } from "../js/olMap";

export default function GuidePreviewFeatureContent({ f }) {
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

  const getNearestStopFromPoint = (geom) => {
    // TODO: To be implemented
    // For now, just return the second stop
    return 2;
  };

  const handleActivateGuide = async (from = "start") => {
    // activateGuide(lineFeature);
    // const stopNumber =
    //   from === "start" ? 1 : getNearestStopFromPoint([123, 456]);
    // console.log(
    //   `Activating guide ${lineFeature.get(
    //     "guideId"
    //   )} from stop number ${stopNumber}`
    // );
    // Set selected guide ID in store. This will limit features to
    // those that belong to this certain guide only.
    // await f7.store.dispatch("setActiveGuideId", lineFeature.get("guideId"));
    // await f7.store.dispatch("setActiveStopNumber", stopNumber);
    // Tell OL map to update itself by looking into selectedFeatures,
    // which will take into account the limit that we imposed above.
    // updateFeaturesInMap();
  };

  return (
    <>
      <div className="swipe-handler"></div>
      <BlockTitle>{lineFeature.get("title")}</BlockTitle>
      {pointFeature !== null && (
        <Block>
          {`Stopp ${pointFeature.get("stopNumber")}: ${pointFeature.get(
            "title"
          )}`}
        </Block>
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
        <Button
          outline
          round
          sheetClose
          onClick={() => handleActivateGuide("start")}
          style={{ marginBottom: "1rem" }}
        >
          Starta från början
        </Button>
        {pointFeature ? (
          <Button
            fill
            large
            round
            sheetClose
            onClick={() => handleActivateGuide(pointFeature.get("stopNumber"))}
          >
            Starta från {pointFeature.get("title")}
          </Button>
        ) : (
          <Button
            fill
            round
            large
            sheetClose
            onClick={() => handleActivateGuide("nearest")}
          >
            Starta från närmaste
          </Button>
        )}
      </Block>
    </>
  );
}
