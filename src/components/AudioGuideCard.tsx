import React from "react";
import {
  f7,
  Block,
  Button,
  Card,
  CardContent,
  CardHeader,
  Link,
  Chip,
  Icon,
  Badge,
} from "framework7-react";
import { getAssets } from "../js/getAssets";
import { handleShowGuideInMap, parseStyle } from "../js/f7Helpers";
import { copyToClipboard } from "../js/utils";

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
    <Card
      expandable
      backdropEl=".card-backdrop.custom-backdrop"
      onCardOpen={() => {
        f7.store.dispatch("trackAnalyticsEvent", {
          eventName: "guideClickedInPhotoList",
          guideId: feature.get("guideId"),
        });
      }}
    >
      <CardContent padding={false}>
        <div
          style={{
            backgroundImage: `url(${images[0]})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "cover",
            height: "240px",
          }}
        />
        <Link
          cardClose
          color="white"
          className="card-opened-fade-in"
          style={{ position: "absolute", right: "15px", top: "15px" }}
          iconF7="xmark_circle_fill"
        />
        <CardHeader style={{ height: "60px" }}>
          <div>{feature.get("title")}</div>
          <Badge
            style={{ backgroundColor: parseStyle(feature).strokeColor }}
          ></Badge>
        </CardHeader>
        {/* Chips with categories and guide length */}
        <Block>
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
                <Chip text={c} key={i} style={{ marginRight: "2px" }} />
              ))}
            <Chip
              text={feature.get("length")}
              tooltip={`Guidens längd är ${feature.get("length")}`}
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

        <Block>
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
          <div className="card-content-padding">{feature.get("text")}</div>
          <Button
            round
            onClick={handleCopyLinkToGuide}
            className="margin-top margin-bottom"
          >
            Kopiera länk till guide
          </Button>
        </Block>
      </CardContent>
    </Card>
  );
}

export default AudioguideCard;
