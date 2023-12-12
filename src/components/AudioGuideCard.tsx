import React from "react";
import {
  f7,
  Block,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Link,
} from "framework7-react";
import { getAssets } from "../js/getAssets";

function AudioguideCard({ c }) {
  const images = getAssets(c, "images");

  const handleShowGuideInMap = async () => {
    f7.emit("olFeatureSelected", [c]);

    // Switch back to map tab
    f7.tab.show("#tab-map");
  };

  return (
    <Card expandable>
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
        <CardHeader style={{ height: "60px" }}>{c.get("title")}</CardHeader>
        <CardFooter>
          {`${c.get("length")} - ${c.get("categories").split(",").join(", ")}`}
        </CardFooter>
        <Block>
          <div className="card-content-padding">{c.get("text")}</div>
          <Button
            fill
            round
            large
            cardClose
            onClick={handleShowGuideInMap}
            className="margin-bottom"
          >
            Lyssna på guiden
          </Button>
        </Block>
      </CardContent>
    </Card>
  );
}

export default AudioguideCard;
