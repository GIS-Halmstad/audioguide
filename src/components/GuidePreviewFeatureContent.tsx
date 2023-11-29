import React, { useEffect, useState } from "react";

import { f7, Block, BlockTitle, Sheet, Button } from "framework7-react";

import { Feature } from "openlayers";

import { activateGuide } from "../js/olMap";

export default function GuidePreviewFeatureContent({ f }) {
  let pointFeature: Feature | null = null;
  let lineFeature: Feature | null = null;

  if (f.getGeometry().getType() === "Point") {
    pointFeature = f;
    lineFeature = f7.store.state.allLines.find(
      (lf: Feature) => lf.get("guideId") === pointFeature?.get("guideId")
    );
  } else {
    lineFeature = f;
  }

  const getNearestStopFromPoint = (geom: number[]) => {
    // TODO: To be implemented
    // For now, just return the second stop
    return 2;
  };

  const handleActivateGuide = async (from: Number | string = 1) => {
    const fromStopNumber =
      typeof from === "number" ? from : getNearestStopFromPoint([123, 456]);
    activateGuide(lineFeature?.get("guideId"), fromStopNumber);
  };

  return (
    lineFeature !== null && (
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
            onClick={() => handleActivateGuide(1)}
            style={{ marginBottom: "1rem" }}
          >
            Starta från början
          </Button>
          {pointFeature !== null ? (
            <Button
              fill
              large
              round
              sheetClose
              onClick={() => {
                handleActivateGuide(pointFeature?.get("stopNumber"));
              }}
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
    )
  );
}
