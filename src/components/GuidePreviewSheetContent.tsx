// Imports
import React, { useMemo } from "react";

import { useTranslation } from "react-i18next";

import {
  f7,
  Block,
  BlockTitle,
  Button,
  Icon,
  Chip,
  List,
  ListItem,
  Badge,
  useStore,
  Link,
} from "framework7-react";

import AudioguideMarkdown from "../js/AudioguideMarkdown";

import {
  activateGuide,
  getClosestStopNumberFromCurrentPosition,
} from "../js/openlayers/olMap";

import { getAssets } from "../js/getAssets";

// Type imports and definitions
import { handleCopyLinkToGuide, parseStyle } from "../js/f7Helpers";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import {
  prepareStringFromDbForMarkdown,
  thumbalizeImageSource,
} from "../js/utils";

type Props = {
  f: Feature;
};

type StopObject = {
  stopNumber: number;
  title: string;
  geometry: Geometry;
};

export default function GuidePreviewSheetContent({ f }: Props) {
  const { t } = useTranslation("guidePreviewSheetContent");
  // f can be either a Point or a LineString, so let's find out.
  let pointFeature: Feature | null = null;
  let lineFeature: Feature;

  if (f.getGeometry()?.getType() === "Point") {
    pointFeature = f;
    lineFeature = f7.store.state.allLines.find(
      (lf: Feature) => lf.get("guideId") === pointFeature?.get("guideId")
    );
  } else {
    lineFeature = f;
  }

  // We need to know if geolocation is available, as this determines
  // which start buttons will be shown.
  const geolocationStatus = useStore("geolocationStatus");

  const listOfStops: StopObject[] = useMemo(() => {
    return f7.store.state.allPoints
      .filter((pf: Feature) => pf.get("guideId") === lineFeature.get("guideId"))
      .sort((pf: Feature) => pf.get("stopNumber"))
      .map((pf: Feature) => {
        return {
          stopNumber: pf.get("stopNumber"),
          title: pf.get("title"),
          geometry: pf.getGeometry(),
        };
      });
  }, [lineFeature]);

  const handleActivateGuide = async (from?: Number) => {
    const fromStopNumber =
      typeof from === "number"
        ? from
        : getClosestStopNumberFromCurrentPosition(lineFeature?.get("guideId"));
    activateGuide(lineFeature.get("guideId"), fromStopNumber);
  };

  const images = getAssets(lineFeature, "images");

  return (
    lineFeature !== null && (
      <>
        {/* Initial step in the sheet must be within .sheet-modal-swipe-step */}
        <div className="sheet-modal-swipe-step">
          {/* Swipe to close handler */}
          <div className="swipe-handler"></div>

          {/* Swiper component with guide photos */}
          <swiper-container
            css-mode={false} // FIXME: Seems troublesome when set to true on iOS Safari, false for now but keep in mind.
            loop={true}
            pagination={true}
            initial-slide={0}
            space-between={5}
            style={{
              borderBottomColor: parseStyle(lineFeature).strokeColor,
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

          {/* Click to close button */}
          <Link
            className="sheet-icon"
            sheetClose=".preview-sheet"
            iconF7="xmark_circle"
          />

          {/* Guide title and chips */}
          <Block className="margin-top-half padding-bottom no-margin-bottom">
            {/* Title */}
            <div
              style={{ fontSize: "1.5rem", fontWeight: "600" }}
              className="margin-bottom-half"
            >
              {lineFeature.get("title")}
            </div>

            {/* Chips with categories and guide length */}
            <div
              className="padding-top-half padding-bottom-half margin-bottom"
              style={{
                borderTop: "1px solid var(--f7-md-outline)",
                borderBottom: "1px solid var(--f7-md-outline)",
              }}
            >
              {lineFeature
                .get("categories")
                ?.split(",")
                .map((c: string, i: number) => (
                  <Chip text={c} key={i} style={{ marginRight: "2px" }} />
                ))}
              <Chip
                text={f.get("length")}
                tooltip={t("guidesLengthTooltip", {
                  length: f.get("length"),
                  ns: "audioguideCard",
                })}
                mediaBgColor="primary"
              >
                <Icon
                  slot="media"
                  ios="material:straighten"
                  md="material:straighten"
                />
              </Chip>
            </div>

            {/* Start buttons */}
            {pointFeature !== null ? (
              <Button
                style={{ width: "100%" }}
                fill
                round
                large
                sheetClose
                onClick={() => {
                  handleActivateGuide(pointFeature?.get("stopNumber"));
                }}
              >
                {t("startFromStopNumber", {
                  stopNumber: pointFeature.get("stopNumber"),
                })}
              </Button>
            ) : (
              geolocationStatus === "granted" && (
                <Button
                  style={{ width: "100%" }}
                  fill
                  round
                  large
                  sheetClose
                  onClick={() => handleActivateGuide()}
                >
                  {t("startFromClosestStop")}
                </Button>
              )
            )}
            <Button
              style={{ width: "100%" }}
              fill={geolocationStatus !== "granted"} // fill if this action is primary (i.e. if geolocation isn't available)
              large={geolocationStatus !== "granted"} // large if this action is primary (i.e. if geolocation isn't available)
              round
              sheetClose
              onClick={() => handleActivateGuide(1)}
              className="margin-top"
            >
              {t("startFromFirstStop")}
            </Button>
          </Block>
        </div>

        {/* The scrollable sheet area, contains guide description */}
        <div
          className="page-content"
          style={{
            maxHeight: "27vh",
          }}
        >
          <Block className="no-margin-top">
            <AudioguideMarkdown>
              {prepareStringFromDbForMarkdown(lineFeature.get("text"))}
            </AudioguideMarkdown>
          </Block>
          <BlockTitle medium>{t("stopsAlongTheGuide")}</BlockTitle>
          <List>
            {listOfStops.map((s, i) => (
              <ListItem
                link="#"
                sheetClose
                onClick={() => {
                  handleActivateGuide(s.stopNumber);
                }}
                key={i}
              >
                <Badge slot="media">{s.stopNumber}</Badge>
                <div slot="title">{s.title}</div>
              </ListItem>
            ))}
          </List>
          <Block>
            <Button
              onClick={() =>
                handleCopyLinkToGuide(
                  lineFeature.get("guideId"),
                  pointFeature !== null
                    ? pointFeature.get("stopNumber")
                    : undefined
                )
              }
            >
              {t("copyLink", { ns: "common" })}
            </Button>
          </Block>
          <Block>
            <img
              src="bottom-ornament.svg"
              className="sheet-bottom-ornament"
              alt="Decorative bottom ornament"
            />
          </Block>
        </div>
      </>
    )
  );
}
