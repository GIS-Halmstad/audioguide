import React from "react";
import {
  Badge,
  Block,
  BlockTitle,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Icon,
  Link,
  Popover,
  f7,
} from "framework7-react";

import { getAssets } from "../js/getAssets";
import { handleShowGuideInMap, parseStyle } from "../js/f7Helpers";
import { trimString } from "../js/utils";

function AudioguideCard({ feature }) {
  const images = getAssets(feature, "images");

  // Each guide needs a unique ID that must start with a
  // letter to be a valid DOM ID.
  const popoverId = "popover-" + f7.utils.id();

  return (
    <>
      <Popover id={popoverId}>
        <BlockTitle>Kategori</BlockTitle>
        <Block>
          {feature
            .get("categories")
            ?.split(",")
            .map((c: string, i: number) => (
              <Chip text={c} key={i} className="margin-right-half" />
            ))}
        </Block>
        <BlockTitle>Längd</BlockTitle>
        <Block>
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
        </Block>
      </Popover>
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
            className="margin-bottom display-flex justify-content-space-between align-items-center"
            style={{ fontSize: "1.5rem", fontWeight: "600" }}
          >
            {feature.get("title")}
            <Link popoverOpen={"#" + popoverId}>
              <Icon slot="media" ios="f7:info_circle" md="material:info" />
            </Link>
          </div>

          <div className="short-description">
            {trimString(feature.get("text"), 180)}
          </div>
          <Button
            fill
            round
            large
            cardClose
            onClick={() => handleShowGuideInMap(feature, 600)}
            className="margin-top margin-bottom"
          >
            Mer om guiden
          </Button>
        </CardContent>
      </Card>
    </>
  );
}

export default AudioguideCard;
