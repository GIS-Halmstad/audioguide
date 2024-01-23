import React from "react";

import { Block, BlockTitle, Button, Link, f7 } from "framework7-react";

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

  const handleClickOnCloseGuide = () => {
    f7.dialog.confirm(
      "Vill du verkligen avsluta guiden?",
      "Avsluta guide",
      () => {
        // On OK
        f7.sheet.close();
      }
    );
  };

  return (
    <>
      {/* Initial step in the sheet must be within .sheet-modal-swipe-step */}
      <div className="sheet-modal-swipe-step">
        <div
          className="swipe-handler"
          onClick={() => f7.sheet.stepToggle(".active-guide-sheet")}
        />

        <swiper-container
          cssMode="true"
          pagination
          space-between="50"
          color="white"
        >
          {images.map((src, i) => (
            <swiper-slide key={i} className="swiper-slide-custom">
              <div
                className="image-container"
                style={{ backgroundImage: `url(${src})` }}
              />
            </swiper-slide>
          ))}
        </swiper-container>

        <Link
          className=""
          style={{
            position: "absolute",
            right: "15px",
            top: "15px",
            color: "white",
          }}
          iconF7="xmark_circle_fill"
          onClick={handleClickOnCloseGuide}
        />

        <Block className="display-flex justify-content-space-between no-margin margin-top-half">
          <Button
            tonal={showPrev}
            iconMd="material:arrow_back"
            iconIos="f7:chevron_left"
            disabled={!showPrev}
            onClick={() => {
              goToStopNumber(activeStopNumber - 1);
            }}
          />
          <BlockTitle
            className="no-margin"
            style={{
              height: "var(--f7-button-height)",
              lineHeight:
                "calc(var(--f7-button-height) - var(--f7-button-border-width, 0) * 2)",
            }}
          >
            {title}
          </BlockTitle>
          <Button
            tonal={showNext}
            iconMd="material:arrow_forward"
            iconIos="f7:chevron_right"
            disabled={!showNext}
            onClick={() => {
              goToStopNumber(activeStopNumber + 1);
            }}
          />
        </Block>

        <Block className="no-margin margin-top-half margin-bottom">
          <audio
            controls
            src={audios[0]}
            style={{ width: "100%" }}
            onPlay={() => {
              if ("mediaSession" in navigator) {
                navigator.mediaSession.metadata = new MediaMetadata({
                  title: `${activeStopNumber}: ${point.get("title")}`,
                  artist: activeGuideObject.line.get("title"),
                  // TODO: Consider adding artwork
                });

                navigator.mediaSession.setActionHandler("play", () => {
                  document.querySelector("audio")?.play();
                });

                navigator.mediaSession.setActionHandler("stop", () => {
                  document.querySelector("audio")?.pause();
                });

                navigator.mediaSession.setActionHandler("pause", () => {
                  document.querySelector("audio")?.pause();
                });

                navigator.mediaSession.setActionHandler(
                  "seekbackward",
                  (event) => {
                    let skipTime = event.seekOffset || 10; // default skip time to 10 seconds
                    const audio = document.querySelector("audio");
                    if (audio) {
                      audio.currentTime = Math.max(
                        audio.currentTime - skipTime,
                        0
                      );
                    }
                  }
                );

                navigator.mediaSession.setActionHandler(
                  "seekforward",
                  (event) => {
                    let skipTime = event.seekOffset || 10; // default skip time to 10 seconds
                    const audio = document.querySelector("audio");
                    if (audio) {
                      audio.currentTime = Math.min(
                        audio.currentTime + skipTime,
                        audio.duration
                      );
                    }
                  }
                );

                // These would work, but I'm not sure it's a good idea
                // to change step from the lock screen controls.
                // navigator.mediaSession.setActionHandler(
                //   "previoustrack",
                //   () => {
                //     goToStopNumber(activeStopNumber - 1);
                //   }
                // );

                // navigator.mediaSession.setActionHandler("nexttrack", () => {
                //   goToStopNumber(activeStopNumber + 1);
                // });
              }
            }}
            onPause={() => {
              if ("mediaSession" in navigator) {
                navigator.mediaSession.playbackState = "paused";
              }
            }}
            // Works, but not a good idea as it cleans up the title upon done listening
            // onEnded={() => {
            //   if (
            //     "mediaSession" in navigator &&
            //     navigator.mediaSession.metadata
            //   ) {
            //     // Clear the mediaSession metadata when the audio track has ended
            //     navigator.mediaSession.metadata = null;
            //     console.log("Audio track ended, cleared mediaSession");
            //   }
            // }}
          >
            <a href={audios[0]}>Ladda ner ljudfilen</a>
          </audio>
        </Block>
      </div>

      <div className="page-content" style={{ maxHeight: "27vh" }}>
        <Block className="no-margin-top">{text}</Block>
        <Button onClick={handleClickOnCloseGuide} className="margin-bottom">
          Avsluta guiden
        </Button>
      </div>
    </>
  );
}

export default GuideSheetContent;
