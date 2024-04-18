import React, { useEffect } from "react";
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

  useEffect(() => {
    const swiperEl = f7.swiper.get(".active-guide-sheet swiper-container");
    if (swiperEl) {
      // Update Swiper to ensure that the correct amount of
      // image sliders are shown.
      swiperEl.update();
      // Also, go to the first image, but disable the transition by setting its length to 0ms.
      swiperEl.slideTo(0, 0, false);
    }

    const pageContent = document.querySelector(
      ".active-guide-sheet .page-content"
    );
    if (pageContent && pageContent.scrollTop) {
      // Scroll to top when sheet renders
      pageContent.scrollTop = 0;
    }
  }); // Yes, let's run this on each render

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
        <div className="swipe-handler" />

        <swiper-container
          css-mode={false} // FIXME: Seems troublesome when set to true on iOS Safari, false for now but keep in mind.
          loop={false} // Can't be true, as it breaks the .slideTo() in the useEffect
          pagination={true}
          initial-slide={0}
          space-between={5}
          style={{
            borderBottomColor: parseStyle(activeGuideObject.line).strokeColor,
            borderBottomWidth: "10px",
            borderBottomStyle: "solid",
          }}
        >
          {videos.map((src, i) => (
            <swiper-slide key={i} className="swiper-slide-custom">
              <video
                controls
                controlsList="nodownload"
                poster={images[0]}
                src={src}
                style={{
                  width: "100%",
                  height: "95%",
                  backgroundColor: "#000",
                }}
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
            </swiper-slide>
          ))}
          {images.map((src, i) => (
            <swiper-slide
              key={videos.length + i} // We don't want i to restart on 0, hence add up to the amount of videos
              className="swiper-slide-custom"
            >
              <div
                className="image-container"
                style={{
                  backgroundImage: `url(${thumbalizeImageSource(src)})`,
                }}
              ></div>
              <Link
                iconF7="expand"
                className="sheet-icon expand-icon"
                onClick={() =>
                  f7.emit("showFullscreenSwiper", {
                    sources: images,
                    currentIndex: i,
                  })
                }
              />
            </swiper-slide>
          ))}
        </swiper-container>

        <Link
          className="sheet-icon"
          iconF7="xmark_circle"
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
              textAlign: "center",
            }}
          >
            <b>
              {`${activeGuideObject.line.get(
                "title"
              )} (${activeStopNumber}\u00A0av\u00A0${
                // \u00A0 is a non-breaking space: we want "x of y" to appear on the same line
                Object.entries(activeGuideObject.points).length
              })`}
            </b>
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

        <Block className="no-margin margin-top-half margin-bottom">
          <audio
            controls
            controlsList="nodownload"
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

      <div className="page-content padding-bottom">
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
