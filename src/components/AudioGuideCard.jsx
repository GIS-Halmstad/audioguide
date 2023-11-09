import React from "react";
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Link,
} from "framework7-react";
import { getAssets } from "../js/getAssets.js";

function AudioGuideCard({ c }) {
  const images = getAssets(c, "images");

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
        <div className="card-content-padding">
          {c.get("text")}
          <Button fill round large cardClose>
            Stäng
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default AudioGuideCard;
