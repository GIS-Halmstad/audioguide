import React from "react";

import { f7, Badge, List, ListItem, useStore } from "framework7-react";

import { Feature } from "ol";

import { handleShowGuideInMap, parseStyle } from "../js/f7Helpers";
import NoGuidesAvailable from "./NoGuidesAvailable";

function TabShortListViewContent() {
  const filteredFeatures = useStore("filteredFeatures") as Feature[];

  return filteredFeatures.length > 0 ? (
    <List dividersIos outlineIos strongIos>
      {filteredFeatures
        .filter((f) => f.get("length")) // Only line features will have the "length" property
        .map((f, i) => (
          <ListItem
            key={i}
            onClick={() => {
              f7.store.dispatch("trackAnalyticsEvent", {
                eventName: "guideClickedInShortList",
                guideId: f.get("guideId"),
              });
              handleShowGuideInMap(f);
            }}
            title={f.get("title")}
            badge={f.get("length")}
          >
            <Badge
              slot="media"
              style={{ backgroundColor: parseStyle(f).strokeColor }}
            />
          </ListItem>
        ))}
    </List>
  ) : (
    <NoGuidesAvailable />
  );
}

export default TabShortListViewContent;
