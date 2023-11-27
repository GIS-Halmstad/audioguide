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
import { getAssets } from "../js/getAssets.js";
import { updateFeaturesInMap } from "../js/olMap.js";

function AudioGuideCard({ c }) {
  const images = getAssets(c, "images");

  const handleShowGuideInMap = async () => {
    // Set selected guide ID in store. This will limit features to
    // those that belong to this certain guide only.
    // await f7.store.dispatch("setSelectedGuideId", c.get("guideId"));

    // Tell OL map to update itself by looking into selectedFeatures,
    // which will take into account the limit that we imposed above.
    // updateFeaturesInMap();

    // Next, let's find out the LineString feature and ensure
    // that OL pre-selects it for us.
    // const line = f7.store.getters.selectedFeatures.value.filter((f) =>
    //   f.get("length")
    // );
    console.log("emit line: ", c);
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
          <Button fill round large cardClose onClick={handleShowGuideInMap}>
            Visa i karta
          </Button>
        </Block>
      </CardContent>
    </Card>
  );
}

export default AudioGuideCard;
