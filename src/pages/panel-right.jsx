import React from "react";
import { f7, Page, Navbar, useStore, List, ListItem } from "framework7-react";

import { updateFeaturesInMap } from "../js/olMap";

function PanelRight() {
  const selectedCategories = useStore("selectedCategories");

  const handleCategoryChange = (e) => {
    const { name, checked } = e.target;
    if (checked === true && !selectedCategories.includes(name)) {
      // We must use the spread syntax, rather than push, in order
      // not to mutate the selectedCategories itself. (Same as for React's State.)
      f7.store.dispatch("setSelectedCategories", [...selectedCategories, name]);
      updateFeaturesInMap();
    } else if (
      checked === false &&
      selectedCategories.includes(e.target.name)
    ) {
      // The .filter() method returns a new Array, which we want
      // in order to keep the store reactive.
      f7.store.dispatch(
        "setSelectedCategories",
        selectedCategories.filter((el) => el !== name)
      );
      updateFeaturesInMap();
    } else {
      console.warn("SHOULD NOT SHOW");
    }
  };
  return (
    <Page>
      <Navbar title="Filtrera" />
      <List outlineIos strongMd strongIos>
        {f7.store.state.allCategories.map((c, i) => {
          return (
            <ListItem
              key={i}
              checkbox
              checked={selectedCategories.includes(c)}
              onChange={handleCategoryChange}
              title={c}
              name={c}
            />
          );
        })}
      </List>
    </Page>
  );
}

export default PanelRight;
