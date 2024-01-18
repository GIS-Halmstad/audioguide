import React from "react";
import { List, ListItem, Navbar, Page, f7 } from "framework7-react";
import store from "../js/store";
import { updateFeaturesInMap } from "../js/olMap";

function PanelLeft() {
  const handleShowAllGuides = async () => {
    // Tell OL to deselect any features
    f7.emit("olFeatureSelected", []);

    // Tell the Store to select all categories
    await store.dispatch("setFilteredCategories", store.state.allCategories);

    // Ensure that no guide remains active
    store.dispatch("deactivateGuide");

    // Tell OL to update the map view
    updateFeaturesInMap();

    // Ensure we go to the List view…
    f7.tab.show("#tab-list");

    // …and that we close the panel.
    f7.panel.close("left");
  };

  return (
    <Page>
      <Navbar title="Meny" />
      <List strong outlineIos dividersIos insetMd accordionList>
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
