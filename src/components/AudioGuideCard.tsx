import React from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Chip,
  f7,
  Icon,
  Link,
} from "framework7-react";

import { getAssets } from "../js/getAssets";
import { handleShowGuideInMap, parseStyle } from "../js/f7Helpers";
import { copyToClipboard, trimString } from "../js/utils";

function AudioguideCard({ feature }) {
  const images = getAssets(feature, "images");

  const handleCopyLinkToGuide = () => {
    // Remove any possibly existing hash params and grab the first part.
    const hrefWithoutHash = window.location.href.split("#")[0];

    copyToClipboard(
      `${hrefWithoutHash}#g=${feature.get("guideId")}`,
      f7.dialog.alert
    );
  };

  return (
    <Card>
      <CardHeader
        style={{
          backgroundImage: `url(${images[0]})`,
          borderBottomColor: parseStyle(feature).strokeColor,
          borderBottomWidth: "10px",
          borderBottomStyle: "solid",
        }}
      >
        {feature.get("highlightLabel") && (
          <Badge
            style={{
              backgroundColor:
                parseStyle(feature).fillColor || "var(--f7-md-surface)",
              color:
                parseStyle(feature).onFillColor || "var(--f7-md-on-surface)",

              position: "absolute",
              top: "var(--f7-typography-margin)",
              right: "var(--f7-typography-margin)",
            }}
          >
            {feature.get("highlightLabel")}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div
          className="margin-bottom"
          style={{ fontSize: "1.5rem", fontWeight: "600" }}
        >
          {feature.get("title")}
        </div>

        <div
          className="padding-top-half padding-bottom-half"
          style={{
            borderTop: "1px solid var(--f7-md-outline)",
            borderBottom: "1px solid var(--f7-md-outline)",
          }}
        >
          {feature
            .get("categories")
            ?.split(",")
            .map((c: string, i: number) => (
              <Chip text={c} key={i} className="margin-right-half" />
            ))}
          <Chip
            text={feature.get("length")}
            tooltip={`Guidens längd är ${feature.get("length")}`}
            mediaBgColor="primary"
          >
            <Icon
              slot="media"
              ios="material:straighten"
              md="material:straighten"
            />
          </Chip>
        </div>

        <Button
          fill
          round
          large
          cardClose
          onClick={() => handleShowGuideInMap(feature, 600)}
          className="margin-top margin-bottom"
        >
          Lyssna på guiden
        </Button>
        <div className="short-description">
          {trimString(feature.get("text"), 180)}
        </div>
      </CardContent>

      <CardFooter>
        <Link onClick={() => handleShowGuideInMap(feature, 600)}>Läs mer</Link>
        <Link onClick={handleCopyLinkToGuide}>Kopiera länk</Link>
      </CardFooter>
    </Card>
  );
}

export default AudioguideCard;
