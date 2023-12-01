import React, { useState } from "react";

import {
  f7,
  Block,
  BlockTitle,
  Sheet,
  Button,
  useStore,
} from "framework7-react";

import { getAssets } from "../js/getAssets";

import { goToStopNumber } from "../js/olMap";

function GuideSheetPointView({ activeGuideObject, activeStopNumber }) {
  console.log(
    "Render GuideSheetPointView: ",
    activeGuideObject,
    activeStopNumber,
    typeof activeStopNumber,
    Object.entries(activeGuideObject.points).length
  );

  const point = activeGuideObject.points[activeStopNumber];

  const images = getAssets(point, "images");
  const videos = getAssets(point, "videos");
  const audios = getAssets(point, "audios");
  const title = point.get("title");
  const text = point.get("text");

  return (
    <>
      <swiper-container
        pagination
        class="demo-swiper-multiple"
        space-between="50"
        navigation="true"
        style={{ marginBottom: 0 }}
      >
        {images.map((src, i) => (
          <swiper-slide key={i}>
            <img src={src} />
          </swiper-slide>
        ))}
      </swiper-container>
      <div
        className="page-content"
        style={{ maxHeight: "300px", paddingTop: 0 }}
      >
        <BlockTitle>{title}</BlockTitle>
        <Block>{text}</Block>
      </div>
      <Block>
        <audio controls src={audios[0]} style={{ width: "100%" }}>
          <a href={audios[0]}>Ladda ner ljudfilen</a>
        </audio>
      </Block>
    </>
  );
}

export default GuideSheetPointView;
