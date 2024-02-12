// Imports
import React, { useMemo } from "react";

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

import {
  activateGuide,
  getClosestStopNumberFromCurrentPosition,
} from "../js/openlayers/olMap";

import { getAssets } from "../js/getAssets";

// Type imports and definitions
import { Feature, geom } from "openlayers";
import {
  handleCopyLinkToGuide,
  parseStyle,
  toggleFullscreen,
} from "../js/f7Helpers";

type Props = {
  f: Feature;
};

type StopObject = {
  stopNumber: number;
  title: string;
  geometry: geom.Geometry;
};

export default function GuidePreviewSheetContent({ f }: Props) {
  // f can be either a Point or a LineString, so let's find out.
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

  const geolocationError = useStore("geolocationError");

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
          <div
            className="swipe-handler"
            onClick={() => f7.sheet.stepToggle(".preview-sheet")}
          ></div>

          {/* Swiper component with guide photos */}
          <swiper-container
            cssMode="true"
            pagination
            space-between="50"
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
                  style={{ backgroundImage: `url(${src})` }}
                  data-img-src={src}
                  // onClick={toggleFullscreen}
                  onClick={() => f7.emit("showFullscreenSwiper", images)}
                >
                  <Link
                    style={{
                      position: "absolute",
                      right: "15px",
                      top: "15px",
                      color: "white",
                    }}
                    iconF7="xmark_circle_fill"
                  />
                </div>
              </swiper-slide>
            ))}
          </swiper-container>

          {/* Click to close button */}
          <Link
            style={{
              position: "absolute",
              right: "15px",
              top: "15px",
              color: "white",
            }}
            sheetClose=".preview-sheet"
            iconF7="xmark_circle_fill"
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
                text={lineFeature.get("length")}
                tooltip={`Guidens längd är ${lineFeature.get("length")}`}
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
                Starta från stopp {pointFeature.get("stopNumber")}
              </Button>
            ) : (
              geolocationError === null && (
                <Button
                  style={{ width: "100%" }}
                  fill
                  round
                  large
                  sheetClose
                  onClick={() => handleActivateGuide()}
                >
                  Starta från närmaste
                </Button>
              )
            )}
            <Button
              style={{ width: "100%" }}
              fill={geolocationError !== null} // fill if this action is primary (i.e. if geolocation isn't available)
              large={geolocationError !== null} // large if this action is primary (i.e. if geolocation isn't available)
              round
              sheetClose
              onClick={() => handleActivateGuide(1)}
              className="margin-top"
            >
              Starta från början
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
          <Block className="no-margin-top">{lineFeature.get("text")}</Block>
          <BlockTitle medium>Stopp längst vägen</BlockTitle>
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
              Kopiera länk
            </Button>
          </Block>
        </div>
      </>
    )
  );
}
