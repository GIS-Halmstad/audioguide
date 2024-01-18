import React from "react";

import { Badge, BlockTitle, List, ListItem, useStore } from "framework7-react";

import { handleShowGuideInMap, parseStyle } from "../js/f7Helpers";

function TabShortListViewContent() {
  const filteredFeatures = useStore("filteredFeatures");

  return (
    <>
      <BlockTitle>Våra guider</BlockTitle>
      <List dividersIos outlineIos strongIos>
        {filteredFeatures
          .filter((f) => f.get("length")) // Only line features will have the "length" property
          .map((f, i) => (
            <ListItem
              key={i}
              onClick={() => handleShowGuideInMap(f)}
              title={f.get("title")}
              badge={f.get("length")}
            >
              <Badge slot="media" color={parseStyle(f).strokeColor} />
            </ListItem>
          ))}
      </List>
    </>
  );
}

export default TabShortListViewContent;
