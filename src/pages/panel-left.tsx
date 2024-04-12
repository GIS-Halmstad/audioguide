import React from "react";
import { f7, List, ListItem, Navbar, Page } from "framework7-react";
import { handleShowAllGuides } from "../js/f7Helpers";

function PanelLeft() {
  const aboutPageTitle =
    f7.store.state.mapConfig.tools.audioguide.aboutPageTitle || "Om Audioguide";
  return (
    <Page>
      <Navbar title="Meny" />
      <List dividers insetMd accordionList>
        <ListItem
          title="Alla guider"
          panelClose
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
    </Page>
  );
}

export default PanelLeft;
