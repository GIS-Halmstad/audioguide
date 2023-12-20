import React from "react";

import {
  f7,
  Block,
  BlockTitle,
  Button,
  Toolbar,
  Link,
  Card,
  CardContent,
  CardFooter,
} from "framework7-react";

import { getAssets } from "../js/getAssets";

import { goToStopNumber } from "../js/olMap";

function GuideSheetContent({ activeGuideObject, activeStopNumber }) {
  console.log(
    "Render GuideSheetContent: ",
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
    activeGuideObject?.points &&
    activeStopNumber < Object.entries(activeGuideObject?.points).length;

  return (
    <>
      {/* Initial step in the sheet must be within .sheet-modal-swipe-step */}
      <div className="sheet-modal-swipe-step padding-bottom-half">
        <Toolbar>
          <div>{/* Empty left, in order to get the cross on right */}</div>
          <div>
            <Link
              iconIos="f7:xmark_circle_fill"
              iconMd="material:close"
              // color="white"
              onClick={() => {
                f7.dialog.confirm(
                  "Vill du verkligen avsluta guiden?",
                  "Avsluta guide",
                  () => {
                    // On OK
                    f7.sheet.close();
                  }
                );
              }}
            />
          </div>
        </Toolbar>
        <Card outlineMd>
          <swiper-container cssMode="true" pagination space-between="50">
            {images.map((src, i) => (
              <swiper-slide key={i} className="swiper-slide-custom">
                <div
                  className="image-container"
                  style={{ backgroundImage: `url(${src})` }}
                />
              </swiper-slide>
            ))}
          </swiper-container>
          <div className="text-label-2">
            {activeGuideObject.line.get("title")} ({activeStopNumber} av{" "}
            {Object.entries(activeGuideObject.points).length})
          </div>

          <CardContent
            style={{
              ...(f7.device.ios && { paddingLeft: 0, paddingRight: 0 }),
              marginTop: "0.5rem",
            }}
          >
            <Block>
              <audio controls src={audios[0]} style={{ width: "100%" }}>
                <a href={audios[0]}>Ladda ner ljudfilen</a>
              </audio>
            </Block>
          </CardContent>
          <CardFooter className="display-flex justify-content-space-between no-padding-left no-padding-right">
            <Button
              tonal={showPrev}
              iconMd="material:arrow_back"
              iconIos="f7:chevron_left"
              disabled={!showPrev}
              onClick={() => {
                goToStopNumber(activeStopNumber - 1);
              }}
            />
            <div
              className="text-align-center"
              style={{
                lineHeight: "1.7rem",
                fontStyle: "italic",
              }}
            >
              Svep upp för mer info
            </div>
            <Button
              tonal={showNext}
              iconMd="material:arrow_forward"
              iconIos="f7:chevron_right"
              disabled={!showNext}
              onClick={() => {
                goToStopNumber(activeStopNumber + 1);
              }}
            />
          </CardFooter>
        </Card>
      </div>

      <div className="page-content" style={{ maxHeight: "27vh" }}>
        <BlockTitle className="no-margin-top">{title}</BlockTitle>
        <Block>{text}</Block>
      </div>
    </>
  );
}

export default GuideSheetContent;
