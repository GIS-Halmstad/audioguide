import React from "react";
import {
  f7,
  Page,
  Navbar,
  useStore,
  List,
  ListItem,
  Block,
  Button,
} from "framework7-react";

import { updateFeaturesInMap } from "../js/olMap";

function PanelRight() {
  const filteredCategories = useStore("filteredCategories");
  const activeGuideObject = useStore("activeGuideObject");

  const cleanUpSelection = () => {
    f7.store.dispatch("deactivateGuide");
  };

  const handleCategoryChange = (e) => {
    // Before we start toggling categories, let's ensure that no
    // points or guides are selected (as this would limit the results
    // even more than the category selection will).
    cleanUpSelection();

    const { name, checked } = e.target;
    if (checked === true && !filteredCategories.includes(name)) {
      // We must use the spread syntax, rather than push, in order
      // not to mutate the filteredCategories itself. (Same as for React's State.)
      f7.store.dispatch("setFilteredCategories", [...filteredCategories, name]);
      updateFeaturesInMap();
    } else if (
      checked === false &&
      filteredCategories.includes(e.target.name)
    ) {
      // The .filter() method returns a new Array, which we want
      // in order to keep the store reactive.
      f7.store.dispatch(
        "setFilteredCategories",
        filteredCategories.filter((el) => el !== name)
      );
      updateFeaturesInMap();
    } else {
      console.warn("SHOULD NOT SHOW");
    }
  };

  return (
    <Page>
      <Navbar title="Kategorifilter" />
      {activeGuideObject !== null && (
        <>
          <Block>
            Kategorifiltret är inaktivt eftersom du redan valt en specifik
            guide. Rensa valet för att tillåta filtering.
          </Block>
          <Button
            onClick={() => {
              cleanUpSelection();
              updateFeaturesInMap();
            }}
          >
            Återställ filtering
          </Button>
        </>
      )}
      {activeGuideObject === null && (
        <List outlineIos strongMd strongIos>
          {f7.store.state.allCategories.map((c, i) => {
            return (
              <ListItem
                key={i}
                checkbox
                checked={filteredCategories.includes(c)}
                onChange={handleCategoryChange}
                title={c}
                name={c}
              />
            );
          })}
        </List>
      )}
      <Block>
        <Button
          fill
          className="margin-bottom"
          onClick={() => f7.panel.close("right")}
        >
          Filtrera
        </Button>
        {f7.store.state.allCategories.length !==
          f7.store.state.filteredCategories.length && (
          <Button
            color="red"
            small
            onClick={() => {
              // Set filtered categories to all available
              f7.store.dispatch(
                "setFilteredCategories",
                f7.store.state.allCategories
              );

              // Update map
              updateFeaturesInMap();

              // Close the panel
              f7.panel.close("right");
            }}
          >
            Återställ filter
          </Button>
        )}
      </Block>
    </Page>
  );
}

export default PanelRight;
