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
  const selectedGuideId = useStore("selectedGuideId");
  console.log("selectedGuideId: ", selectedGuideId);

  const cleanUpSelection = () => {
    f7.store.dispatch("setSelectedGuideId", null);
    f7.store.dispatch("setSelectedPointId", null);
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
      {selectedGuideId !== null && (
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
      {selectedGuideId === null && (
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
    </Page>
  );
}

export default PanelRight;
