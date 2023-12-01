import React, { useEffect, useState } from "react";

import {
  f7,
  Block,
  BlockTitle,
  Sheet,
  Button,
  Icon,
  BlockHeader,
  BlockFooter,
} from "framework7-react";

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
        <div
          className="swipe-handler"
          onClick={() => f7.sheet.stepToggle(".preview-sheet")}
        ></div>
        {/* Initial step in the sheet must be within .sheet-modal-swipe-step */}
        <div className="sheet-modal-swipe-step">
          <BlockTitle medium>{lineFeature.get("title")}</BlockTitle>
          {pointFeature !== null && (
            <BlockTitle style={{ marginTop: 0 }}>
              {`Stopp ${pointFeature.get("stopNumber")}: ${pointFeature.get(
                "title"
              )}`}
            </BlockTitle>
          )}
          <BlockHeader>Längd: {lineFeature.get("length")}</BlockHeader>

          <Block style={{ paddingBottom: "1rem", marginBottom: 0 }}>
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
                Starta från stopp {pointFeature.get("stopNumber")}
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
            <Button
              outline
              round
              sheetClose
              onClick={() => handleActivateGuide(1)}
              style={{
                marginTop: "1rem",
              }}
            >
              Starta från början
            </Button>
            {/* <Icon material="mkeyboard_double_arrow_up" /> */}
          </Block>
        </div>
        <div
          className="page-content"
          style={{ maxHeight: "400px", paddingBottom: "1rem" }}
        >
          <Block>
            <p>
              <i>
                Kategorier:{" "}
                {lineFeature.get("categories")?.split(",").join(", ")}
              </i>
            </p>
            <p>{lineFeature.get("text")}</p>
          </Block>
        </div>
      </>
    )
  );
}
