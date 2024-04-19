import React from "react";
import { Block, f7, List, ListItem, Navbar, Page } from "framework7-react";
import { handleShowAllGuides } from "../js/f7Helpers";

function PanelLeft() {
  const aboutPageTitle =
    f7.store.state.mapConfig.tools.audioguide.aboutPageTitle || "Om Audioguide";
  return (
    <Page>
      <Navbar title="Meny" />
      <div
        className="display-flex flex-direction-column justify-content-space-between"
        style={{ height: "100%" }}
      >
        <List dividers insetMd accordionList>
          <ListItem
            title="Alla guider"
            panelClose
            link
            noChevron
            onClick={handleShowAllGuides}
          />
          <ListItem link="/share/" title="Dela" />
          {
            // For iOS and Android, if we're not in Standalone mode yet, let's
            // show a link to the installation instructions page.
            f7.device.standalone === false &&
              (f7.device.ios === true || f7.device.android === true) && (
                <ListItem link="/install/" title="Installera appen" />
              )
          }
          <ListItem link="/about/" title={aboutPageTitle} />
        </List>
        <Block>
          <img
            src="bottom-ornament.svg"
            className="padding margin"
            alt="Decorative bottom ornament"
          />
        </Block>
      </div>
    </Page>
  );
}

export default PanelLeft;
