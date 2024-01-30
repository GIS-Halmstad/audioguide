// Imports
import React, { useMemo } from "react";

import {
  f7,
  Block,
  BlockTitle,
  Button,
  Icon,
  Chip,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  List,
  ListItem,
  Badge,
  useStore,
} from "framework7-react";

import {
  activateGuide,
  getClosestStopNumberFromCurrentPosition,
} from "../js/openlayers/olMap";

import { getAssets } from "../js/getAssets";

// Type imports and definitions
import { Feature, geom } from "openlayers";
import { DEFAULT_STROKE_COLOR } from "../js/constants";
import { parseStyle } from "../js/f7Helpers";

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
    activateGuide(lineFeature?.get("guideId"), fromStopNumber);
  };

  const images = getAssets(lineFeature, "images");

  return (
    lineFeature !== null && (
      <>
        {/* Initial step in the sheet must be within .sheet-modal-swipe-step */}

        <div className="sheet-modal-swipe-step">
          <div
            className="swipe-handler"
            onClick={() => f7.sheet.stepToggle(".preview-sheet")}
          ></div>
          <Card>
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
              {lineFeature.get("title")}
              <Badge
                color={parseStyle(lineFeature).strokeColor}
                className="margin-left-half"
                style={{ marginBottom: "3px" }}
              />
            </div>
            <CardContent
              style={{
                ...(f7.device.ios && { paddingLeft: 0, paddingRight: 0 }),
                marginTop: "0.5rem",
              }}
            >
              {/* Chips with categories and guide length */}
              <Block className="display-flex justify-content-space-between">
                <div>
                  {lineFeature
                    .get("categories")
                    ?.split(",")
                    .map((c: string, i: number) => (
                      <Chip
                        outline
                        text={c}
                        key={i}
                        style={{ marginRight: "2px" }}
                      />
                    ))}
                </div>
                <div>
                  <Chip
                    outline
                    text={lineFeature.get("length")}
                    tooltip={`Guidens längd är ${lineFeature.get("length")}`}
                    mediaBgColor="blue"
                  >
                    <Icon
                      slot="media"
                      ios="material:straighten"
                      md="material:straighten"
                    />
                  </Chip>
                </div>
              </Block>
            </CardContent>
            <CardFooter className="flex-direction-column">
              {pointFeature !== null ? (
                <Button
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
                outline={geolocationError === null} // outline if this action is secondary
                fill={geolocationError !== null} // fill if this action is primary (i.e. if geolocation isn't available)
                large={geolocationError !== null} // large if this action is primary (i.e. if geolocation isn't available)
                round
                sheetClose
                onClick={() => handleActivateGuide(1)}
                className="margin-top"
              >
                Starta från början
              </Button>
              <div
                className="margin-top margin-bottom"
                style={{
                  lineHeight: "1.7rem",
                  fontStyle: "italic",
                }}
              >
                Svep upp för mer info
              </div>
            </CardFooter>
          </Card>
        </div>
        <div
          className="page-content"
          style={{
            maxHeight: "27vh",
          }}
        >
          <BlockTitle style={{ marginTop: 0 }}>Beskrivning</BlockTitle>
          <Block>{lineFeature.get("text")}</Block>
          <BlockTitle>Stopp längst vägen</BlockTitle>
          <List>
            {listOfStops.map((s, i) => (
              <ListItem key={i}>
                <Badge slot="media">{s.stopNumber}</Badge>
                <div slot="title">{s.title}</div>
              </ListItem>
            ))}
          </List>
        </div>
      </>
    )
  );
}
