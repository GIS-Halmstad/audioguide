import React from "react";

import { getAssets } from "../js/getAssets.js";
import { f7, Block, BlockTitle, Sheet } from "framework7-react";

function AudioGuideSheet({ f = [] }) {
  const feature = f[0];
  const images = getAssets(feature, "images");
  const audios = getAssets(feature, "audios");
  return (
    <Sheet
      swipeToClose
      opened={feature !== undefined}
      style={{ height: "auto" }}
      breakpoints={[0.33, 0.66]}
      backdrop
      backdropBreakpoint={0.66}
      push
      pushBreakpoint={0.66}
      onSheetClose={() => {
        // Let's call this to inform the OL Map that it should clear its
        // selected features too.
        f7.emit("olFeatureSelected", []);
      }}
    >
      <div className="swipe-handler"></div>
      <div
        style={{
          // display: "flex",
          // alignItems: "center",
          // justifyContent: "center",
          height: "20vh",
        }}
      >
        <BlockTitle>{feature?.get("title")}</BlockTitle>
        <Block>
          {audios.map((urlToAudio, i) => (
            <audio controls src={urlToAudio} key={i} />
          ))}
        </Block>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "20vh",
        }}
      >
        <swiper-container pagination class="demo-swiper demo-swiper-lazy">
          {images.map((src, i) => {
            return (
              <swiper-slide lazy key={i}>
                <img loading="lazy" src={src} />
              </swiper-slide>
            );
          })}
        </swiper-container>
      </div>
      <div
        style={{
          // display: "flex",
          // alignItems: "center",
          // justifyContent: "center",
          height: "20vh",
        }}
      >
        <Block>
          <p>{feature?.get("text")}</p>
          <p>Kategorier: {feature?.get("categories")?.split(",").join(", ")}</p>
          <p>Längd: {feature?.get("length")}</p>
        </Block>
      </div>
    </Sheet>
  );
}

export default AudioGuideSheet;
