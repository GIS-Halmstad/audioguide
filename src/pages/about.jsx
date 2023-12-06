import React from "react";
import { f7, Page, Navbar, Block } from "framework7-react";

import { getOLMap } from "../js/olMap";

const About = () => {
  const audioguideLayersAttribution =
    f7.store.state.mapConfig.tools.audioguide.audioguideLayersAttribution;
  const aboutPageContent =
    f7.store.state.mapConfig.tools.audioguide.aboutPageContent ||
    "No about text available. Add one by setting a value for the `aboutPageContent` property in tool config.";

  // Every time we render, we want to get a list of attributions
  // from currently visible layers (hence, no useEffect here).
  const attributions = getOLMap()
    .getAllLayers()
    .map((l) => l.getAttributions())
    .filter((a) => a.length)
    .join(", ");

  const aboutPageParagraphs = aboutPageContent
    .split("\\n") // Split string on new line…
    .filter((paragraph) => paragraph.length > 0) // …and remove any empty paragraphs.
    .map((paragraph, i) => (
      <p key={i}>{paragraph}</p> // Wrap each paragraph into a P element and render.
    ));

  return (
    <Page>
      <Navbar title="Om Audioguide" backLink="Tillbaka" />
      <div
        className="display-flex flex-direction-column justify-content-space-between"
        style={{ height: "100%" }}
      >
        <Block className="page-content">{aboutPageParagraphs}</Block>
        <div
          style={{ fontSize: "x-small" }}
          className={"margin-left margin-right"}
        >
          <p>
            &copy; 2023-{new Date().getFullYear()} {audioguideLayersAttribution}
          </p>
          <p>Upphovsrätt kartinnehåll: {attributions}.</p>
        </div>
      </div>
    </Page>
  );
};

export default About;
