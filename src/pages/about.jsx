import React, { useRef } from "react";
import { f7, Page, Navbar, Block, Button, Link } from "framework7-react";

import { getOLMap } from "../js/openlayers/olMap";

/**
 * @summary Ensure that the supplied string isn't malformed by parsing it using the DOM.
 * @description Please note that this function doesn't do any actual sanitizing, hence "pseudo".
 * @param {string} html
 * @returns
 */
function pseudoSanitize(html) {
  const doc = document.createElement("div");
  doc.innerHTML = html;
  return doc.innerHTML;
}

const About = () => {
  const popup = useRef(null);
  const audioguideAttribution =
    f7.store.state.mapConfig.tools.audioguide.audioguideAttribution || "";
  const aboutPageContentHtml =
    f7.store.state.mapConfig.tools.audioguide.aboutPageContentHtml ||
    "No about text available. Add one by setting a value for the `aboutPageContentHtml` property in tool config.";

  // Every time we render, we want to get a list of attributions
  // from currently visible layers (hence, no useEffect here).
  const attributions = getOLMap()
    .getAllLayers()
    .map((l) => l.getAttributions())
    .filter((a) => a.length)
    .join(", ");

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
                    <li>mapServiceBase: ${
                      f7.store.state.appConfig.mapServiceBase
                    }</li>
                    <li>mapName: ${f7.store.state.appConfig.mapName}</li>  
                    ${
                      window.screen.orientation &&
                      `<li>${window.screen.width}×${window.screen.height} px - ${window.screen.orientation.type}</li>`
                    }
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
        <Block className="page-content" style={{ marginTop: 0 }}>
          <div
            dangerouslySetInnerHTML={{
              __html: pseudoSanitize(aboutPageContentHtml),
            }}
          />
        </Block>
        <div
          style={{ fontSize: "x-small" }}
          className={"margin-left margin-right margin-bottom"}
        >
          <Button small onClick={createTechnicalPopup}>
            Visa teknisk information
          </Button>
          <hr />
          <p>
            &copy; 2023-{new Date().getFullYear()} {audioguideAttribution}
          </p>
          <p>Upphovsrätt kartinnehåll: {attributions}.</p>
          <p>
            Licens källkod: MIT.{" "}
            <Link href="https://github.com/GIS-Halmstad/audioguide" external>
              Projektet på GitHub
            </Link>
          </p>
        </div>
      </div>
    </Page>
  );
};

export default About;
