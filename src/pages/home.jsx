import React, { useEffect, useRef, useState } from "react";
import {
  f7,
  Page,
  Navbar,
  NavTitle,
  Link,
  Toolbar,
  Block,
  Tabs,
  Tab,
  useStore,
  List,
  ListItem,
  NavLeft,
  NavRight,
  Panel,
  View,
  AccordionContent,
} from "framework7-react";

import { updateFeaturesInMap } from "../js/olMap";
import AudioGuideCard from "../components/AudioGuideCard";
import AudioGuideSheet from "../components/AudioGuideSheet";

const HomePage = () => {
  console.log("HomePage init: ", f7);
  const notificationFull = useRef(null);

  const showNotificationFull = () => {
    // Create toast
    if (!notificationFull.current) {
      notificationFull.current = f7.notification.create({
        icon: '<i class="icon f7-icons">xmark_octagon_fill</i>',
        title: "Audioguider",
        titleRightText: "nu",
        subtitle: "Laddningsfel",
        text: "Ett fel uppstod. Vi ber om ursäkt för det inträffade.",
      });
    }
    // Open it
    notificationFull.current.open();
  };

  // useStore hook where we need reactivity
  const loadingError = useStore("loadingError");
  const loading = useStore("loading");
  const selectedFeatures = useStore("selectedFeatures");
  const selectedCategories = useStore("selectedCategories");

  const [selectedFeature, setSelectedFeature] = useState([]);

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

  useEffect(() => {
    console.log("USEEFFECT subscribe");
    f7.on("olFeatureSelected", (f) => {
      console.log("Got selected feature", f);
      setSelectedFeature(f);
    });

    return () => {
      console.log("USEEFFECT unsubscribe");
      f7.off("olFeatureSelected");
    };
  }, [f7, setSelectedFeature]);

  useEffect(() => {
    loadingError === true && showNotificationFull();
  }, [loadingError]);

  const onPageBeforeOut = () => {
    f7.notification.close();
  };
  const onPageBeforeRemove = () => {
    // Destroy toasts when page removed
    if (notificationFull.current) notificationFull.current.destroy();
  };

  return (
    <Page
      pageContent={false}
      name="home"
      onPageBeforeOut={onPageBeforeOut}
      onPageBeforeRemove={onPageBeforeRemove}
    >
      <AudioGuideSheet f={selectedFeature} />
      <Navbar sliding={false}>
        <NavLeft>
          <Link iconIos="f7:menu" iconMd="material:menu" panelOpen="left" />
        </NavLeft>
        <NavTitle sliding>{loading ? "Laddar…" : "Audioguider"}</NavTitle>
        <NavRight>
          <Link
            iconIos="f7:sidebar_right"
            iconMd="f7:sidebar_right"
            panelOpen="right"
          />
        </NavRight>
      </Navbar>

      <Panel left cover>
        <View>
          <Page>
            <Navbar title="Meny" />
            <List strong outlineIos dividersIos insetMd accordionList>
              <ListItem title="Start" />
              {/* <ListItem accordionItem accordionItemOpened title="Bakgrundskarta">
                <AccordionContent>
                  <List outlineIos strongMd strongIos>
                    {f7.store.state.baseLayers.map((c, i) => {
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
                </AccordionContent>
              </ListItem> */}
              <ListItem title="Jämfört kartor" />
              <ListItem title="Om AudioGuiden" />
              <ListItem title="Skriv ut" />
              <ListItem title="Dela" />
            </List>
          </Page>
        </View>
      </Panel>

      <Panel right reveal>
        <View>
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
        </View>
      </Panel>

      <Toolbar tabbar bottom>
        <Link tabLink="#tab-map" tabLinkActive>
          Karta
        </Link>
        <Link tabLink="#tab-list">Lista</Link>
      </Toolbar>

      <Tabs>
        <Tab id="tab-map" className="page-content" tabActive>
          <div id="map" />
        </Tab>
        <Tab id="tab-list" className="page-content">
          <Block>Välj bland följande tillgängliga guider:</Block>
          {selectedFeatures
            .filter((f) => f.get("length")) // Only line features will have the "length" property
            .map((c, i) => (
              <AudioGuideCard c={c} key={i} />
            ))}
        </Tab>
      </Tabs>
      {/* <LoadingErrorSheet opened={loadingError} /> */}
    </Page>
  );
};
export default HomePage;
