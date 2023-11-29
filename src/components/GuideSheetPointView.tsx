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

  const showPrev = activeStopNumber !== 1;

  const showNext =
    activeStopNumber < Object.entries(activeGuideObject.points).length;

  return (
    <>
      <div className="page-content">
        <swiper-container
          pagination
          class="demo-swiper-multiple"
          space-between="50"
          navigation="true"
        >
          {images.map((src, i) => (
            <swiper-slide key={i}>
              <img src={src} />
            </swiper-slide>
          ))}
        </swiper-container>
        <BlockTitle>{title}</BlockTitle>
        <Block>{text}</Block>
        <Block>
          <audio controls src={audios[0]}>
            <a href={audios[0]}>Download audio</a>
          </audio>
        </Block>
        <Block>
          {showPrev && (
            <Button
              onClick={() => {
                goToStopNumber(activeStopNumber - 1);
              }}
            >
              Föregående
            </Button>
          )}
          {showNext && (
            <Button
              onClick={() => {
                goToStopNumber(activeStopNumber + 1);
              }}
            >
              Nästa
            </Button>
          )}
        </Block>
      </div>
    </>
  );
}

export default GuideSheetPointView;
