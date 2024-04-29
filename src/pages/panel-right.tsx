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

import { updateFeaturesInMap } from "../js/openlayers/olMap";
import { handleCopyLinkToGuide } from "../js/f7Helpers";
import { warn } from "../js/logger";

function PanelRight() {
  const filteredCategories = useStore("filteredCategories");
  const activeGuideObject = useStore("activeGuideObject");

  const getEncodedURIComponentFromCurrentFilteredCategories = () =>
    filteredCategories.length !== f7.store.state.allCategories.length
      ? "c=" + encodeURIComponent(filteredCategories.join(","))
      : null;

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
      warn("[panel-right.ts] This should never show.");
    }
  };

  return (
    <Page>
      <Navbar title="Kategorifilter" />
      {activeGuideObject !== null && (
        <>
          <Block>
            Kategorifiltret är inaktiverat eftersom en guide är aktiv. Avsluta
            guiden och kom tillbaka för att kunna se och filtrera kategorierna.
          </Block>
        </>
      )}

      {activeGuideObject === null && (
        <>
          <div
            className="display-flex flex-direction-column justify-content-space-between"
            style={{ height: "100%" }}
          >
            <div>
              <List outlineIos strongMd strongIos>
                {f7.store.state.allCategories.map((c, i) => {
                  return (
                    <ListItem
                      key={i}
                      checkbox
                      checked={filteredCategories.includes(c)}
                      disabled={
                        // If this checkbox is the last one that's selected,
                        // disallow unchecking it.
                        filteredCategories.length <= 1 &&
                        filteredCategories.includes(c)
                          ? true
                          : false
                      }
                      onClick={() => {
                        // If user tries to click on the last selected checkbox,
                        // display an alert saying that it's not allowed to deselect it.
                        if (
                          filteredCategories.length <= 1 &&
                          filteredCategories.includes(c)
                        ) {
                          f7.dialog.alert(
                            "Du måste välja minst en kategori, annars ser du inga audioguider.",
                            "Hoppsan!"
                          );
                        }
                      }}
                      onChange={handleCategoryChange}
                      title={c}
                      name={c}
                    />
                  );
                })}
              </List>
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
                      // f7.panel.close("right");
                    }}
                  >
                    Återställ filter
                  </Button>
                )}
              </Block>
            </div>
            <div>
              {filteredCategories.length !==
                f7.store.state.allCategories.length && (
                <Block>
                  <Button
                    onClick={() =>
                      handleCopyLinkToGuide(
                        undefined,
                        undefined,
                        getEncodedURIComponentFromCurrentFilteredCategories()
                      )
                    }
                  >
                    Kopiera länk till valda
                  </Button>
                </Block>
              )}
            </div>
          </div>
        </>
      )}
    </Page>
  );
}

export default PanelRight;
