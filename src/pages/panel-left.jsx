import React from "react";
import { List, ListItem, Navbar, Page } from "framework7-react";

function PanelLeft() {
  return (
    <Page>
      <Navbar title="Meny" />
      <List strong outlineIos dividersIos insetMd accordionList>
        <ListItem
          title="Alla guider"
          panelClose
          onClick={(e) => console.log(e)}
        />
        <ListItem title="Jämfört kartor" />
        <ListItem title="Skriv ut" />
        <ListItem link="/share/" title="Dela" />
        <ListItem link="/about/" title="Om AudioGuiden" />
      </List>
    </Page>
  );
}

export default PanelLeft;
