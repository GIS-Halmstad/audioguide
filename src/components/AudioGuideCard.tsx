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

import { useTranslation } from "react-i18next";

import { getAssets } from "../js/getAssets";
import { handleShowGuideInMap, parseStyle } from "../js/f7Helpers";
import { trimString, prepareStringFromDbForMarkdown } from "../js/utils";
import AudioguideMarkdown from "../js/AudioguideMarkdown";

function AudioguideCard({ feature }) {
  const { t } = useTranslation("audioguideCard");
  const images = getAssets(feature, "images");

  // Each guide needs a unique ID that must start with a
  // letter to be a valid DOM ID.
  // Due to a faulty TS definition in F7, I disable the rule: id() does not require two arguments.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const popoverId = "popover-" + (f7.utils as any).id();

  return (
    <>
      <Popover id={popoverId}>
        <BlockTitle>{t("category")}</BlockTitle>
        <Block>
          {feature
            .get("categories")
            ?.split(",")
            .map((c: string, i: number) => (
              <Chip
                text={`${t(c, { ns: "guideCategories" })}`}
                key={i}
                className="margin-right-half"
              />
            ))}
        </Block>
        <BlockTitle>{t("guidesLength")}</BlockTitle>
        <Block>
          <Chip
            text={feature.get("length")}
            tooltip={t("guidesLengthTooltip", {
              length: feature.get("length"),
            })}
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
            <AudioguideMarkdown>
              {prepareStringFromDbForMarkdown(
                trimString(feature.get("text"), 165)
              )}
            </AudioguideMarkdown>
          </div>
          <Button
            fill
            round
            large
            cardClose
            onClick={() => {
              f7.store.dispatch("trackAnalyticsEvent", {
                eventName: "guideClickedInPhotoList",
                guideId: feature.get("guideId"),
              });
              handleShowGuideInMap(feature, 600);
            }}
            className="margin-top margin-bottom"
          >
            {t("startGuideButton")}
          </Button>
        </CardContent>
      </Card>
    </>
  );
}

export default AudioguideCard;
