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
  const selectedCategories = useStore("selectedCategories");
  const selectedGuideId = useStore("selectedGuideId");
  console.log("selectedGuideId: ", selectedGuideId);

  const cleanUpSelection = () => {
    if (f7.store.state.selectedGuideId !== null) {
      f7.store.dispatch("setSelectedGuideId", null);
    }
    if (f7.store.state.selectedPointId !== null) {
      f7.store.dispatch("setSelectedPointId", null);
    }
  };

  const handleCategoryChange = (e) => {
    // Before we start toggling categories, let's ensure that no
    // points or guides are selected (as this would limit the results
    // even more than the category selection will).
    cleanUpSelection();

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
      {selectedGuideId !== null && (
        <>
          <Block>
            Filtering är avstängd eftersom en specifik guide har valts. Rensa
            valet för att tillåta filtering.
          </Block>
          <Button onClick={cleanUpSelection}>Rensa valda</Button>
        </>
      )}
      <List outlineIos strongMd strongIos>
        {f7.store.state.allCategories.map((c, i) => {
          return (
            <ListItem
              key={i}
              disabled={selectedGuideId !== null}
              style={{ ...(selectedGuideId !== null && { opacity: 0.3 }) }}
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
