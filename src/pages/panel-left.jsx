import React from "react";
import { List, ListItem, Navbar, Page } from "framework7-react";
import { handleShowAllGuides } from "../js/f7Helpers";

function PanelLeft() {
  return (
    <Page>
      <Navbar title="Meny" />
      <List dividers insetMd accordionList>
        <ListItem
          title="Alla guider"
          panelClose
          onClick={handleShowAllGuides}
        />
        {/* <ListItem title="Jämför kartor" />
        <ListItem title="Skriv ut" /> */}
        <ListItem link="/share/" title="Dela" />
        <ListItem link="/about/" title="Om Audioguide" />
      </List>
    </Page>
  );
}

export default PanelLeft;
