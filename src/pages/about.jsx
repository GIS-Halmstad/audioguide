import React, { useRef } from "react";
import { f7, Page, Navbar, Block, Button } from "framework7-react";

import { getOLMap } from "../js/olMap";

const About = () => {
  const popup = useRef(null);
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

  const createTechnicalPopup = () => {
    console.log(f7.store.state);
    const deviceDetection = Object.entries(f7.device)
      .filter((a) => typeof a[1] !== "function")
      .map((a) => `<li>${a[0]}: ${a[1]}</li>`)
      .join("");

    // Create popup
    if (!popup.current) {
      popup.current = f7.popup.create({
        content: `
          <div class="popup">
            <div class="page">
              <div class="navbar">
                <div class="navbar-inner">
                  <div class="navbar-bg"></div>
                  <div class="title">Teknisk information</div>
                  <div class="right"><a  class="link popup-close">Stäng</a></div>
                </div>
              </div>
              <div class="page-content">
                <div class="block" style="font-family: monospace;">
                  <ul>
                    ${deviceDetection}
                  </ul>
                  <hr />
                  <ul>
                    <li>mapServiceBase: ${f7.store.state.appConfig.mapServiceBase}</li>
                    <li>mapName: ${f7.store.state.appConfig.mapName}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        `.trim(),
      });
    }
    // Open it
    popup.current.open();
  };

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
          className={"margin-left margin-right margin-bottom"}
        >
          <Button small onClick={createTechnicalPopup}>
            Visa teknisk information
          </Button>
          <hr />
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
