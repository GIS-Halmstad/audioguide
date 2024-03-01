import React from "react";
import Markdown from "react-markdown";

import { Block, Button, Link, f7, useStore } from "framework7-react";

import { getAssets } from "../js/getAssets";

import { goToStopNumber } from "../js/openlayers/olMap";
import {
  prepareStringFromDbForMarkdown,
  thumbalizeImageSource,
} from "../js/utils";

import { parseStyle } from "../js/f7Helpers";

function GuideSheetContent({ activeGuideObject }) {
  const activeStopNumber = useStore("activeStopNumber");

  const point = activeGuideObject.points[activeStopNumber];

  const images = getAssets(point, "images");
  const videos = getAssets(point, "videos");
  const audios = getAssets(point, "audios");
  const title = point.get("title");
  const text = point.get("text");

  const isFirstStop = activeStopNumber === 1;

  const isLastStop =
    activeGuideObject?.points &&
    activeStopNumber === Object.entries(activeGuideObject?.points).length;

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

  const handleClickOnGoToPrevious = (): void => {
    if (isFirstStop) {
      f7.dialog.confirm(
        "Du är redan på det första stoppet. Vill du gå tillbaka och hamna på det sista stoppet i guiden?",
        "Redan i början",
        () => {
          goToStopNumber(Object.entries(activeGuideObject?.points).length);
        }
      );
    } else {
      goToStopNumber(activeStopNumber - 1);
    }
  };

  const handleClickOnGoToNext = (): void => {
    if (isLastStop) {
      f7.dialog.confirm(
        "Du är redan på det sista stoppet. Vill du börja om guiden från det första stoppet?",
        "Sista stoppet",
        () => {
          goToStopNumber(1);
        }
      );
    } else {
      goToStopNumber(activeStopNumber + 1);
    }
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
          style={{
            borderBottomColor: parseStyle(activeGuideObject.line).strokeColor,
            borderBottomWidth: "10px",
            borderBottomStyle: "solid",
          }}
        >
          {images.map((src, i) => (
            <swiper-slide key={i} className="swiper-slide-custom">
              <div
                className="image-container"
                style={{
                  backgroundImage: `url(${thumbalizeImageSource(src)})`,
                }}
                onClick={() => f7.emit("showFullscreenSwiper", images)}
              ></div>
            </swiper-slide>
          ))}
        </swiper-container>

        <Link
          style={{
            position: "absolute",
            right: "15px",
            top: "15px",
            color: "white",
          }}
          iconF7="xmark_circle_fill"
          onClick={handleClickOnCloseGuide}
        />

        <Block className="display-flex justify-content-space-between align-items-center no-margin margin-top-half">
          <Button
            tonal={!isFirstStop}
            iconMd="material:arrow_back"
            iconIos="f7:chevron_left"
            onClick={handleClickOnGoToPrevious}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              alignItems: "center",
            }}
          >
            <b>{`${activeGuideObject.line.get(
              "title"
            )} (${activeStopNumber} av ${
              Object.entries(activeGuideObject.points).length
            })`}</b>
            <span className="padding-left-half padding-right-half">
              {title}
            </span>
          </div>
          <Button
            tonal={!isLastStop}
            iconMd="material:arrow_forward"
            iconIos="f7:chevron_right"
            onClick={handleClickOnGoToNext}
          />
        </Block>

        {videos[0] && (
          <Block className="no-margin margin-top-half margin-bottom">
            <video
              controls
              src={videos[0]}
              style={{ width: "100%" }}
              onPlay={() => {
                if ("mediaSession" in navigator) {
                  navigator.mediaSession.metadata = new MediaMetadata({
                    title: `${activeStopNumber}: ${point.get("title")}`,
                    artist: activeGuideObject.line.get("title"),
                    // TODO: Consider adding artwork
                  });
                }
              }}
            ></video>
          </Block>
        )}
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

      <div
        className="page-content padding-bottom"
        style={{ maxHeight: "51vh" }}
      >
        <Block className="no-margin-top">
          <Markdown children={prepareStringFromDbForMarkdown(text)} />
        </Block>
        <Button onClick={handleClickOnCloseGuide} className="margin-bottom">
          Avsluta guiden
        </Button>
      </div>
    </>
  );
}

export default GuideSheetContent;
