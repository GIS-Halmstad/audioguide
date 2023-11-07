import React, { useState, useEffect } from "react";

import {
  f7,
  f7ready,
  App,
  View,
  Popup,
  Page,
  Navbar,
  NavRight,
  Link,
  Block,
  Toolbar,
  useStore,
  Panel,
  List,
  ListItem,
  AccordionContent,
} from "framework7-react";

import routes from "../js/routes";
import store from "../js/store";

import { initOLMap, getOLMap } from "../js/olMap.js";
import { fetchFromService } from "../js/fetchFromService.js";

const MyApp = () => {
  console.log("MyApp renders");

  let olMap;
  const availableCategories = new Set();
  // Framework7 Parameters
  const f7params = {
    name: "AudioGuide",
    theme: "auto",
    store: store,
    routes: routes,
  };

  // When F7 is ready…
  f7ready(async () => {
    // …let's fetch the map config, which contains layers
    // definitions and is required before we can create
    // the OpenLayers map and add layers.
    const response = await fetch(
      `${store.state.appConfig.mapServiceBase}/config/${store.state.appConfig.mapName}`
    );
    const json = await response.json();
    // Let's save the map config to the store for later use.
    store.dispatch("setMapConfig", json);

    // Grab features from WFSs
    const allLines = await fetchFromService("line");
    store.dispatch("setAllLines", allLines);
    const allPoints = await fetchFromService("point");
    store.dispatch("setAllPoints", allPoints);

    // Extract available categories. We want all categories that
    // exist on the line service.
    allLines.forEach((l) => {
      l.get("categories")
        ?.split(",")
        .forEach((c) => availableCategories.add(c));
    });
    store.dispatch("setAvailableCategories", availableCategories);

    // FIXME: Don't assume that only the first category should be selected
    const selectedCategories = new Set([
      Array.from(availableCategories)[0],
      Array.from(availableCategories)[3],
    ]);
    store.dispatch("setSelectedCategories", selectedCategories);

    // Let's initiate the OL map. It will read the store
    // value that we just set, so it's important it comes
    // afterwards.
    await initOLMap();

    // Let's tell the store (and React Components using
    // the useStore hook) that we're done initiating.
    store.dispatch("setLoading", false);
    console.log("APP INIT DONE");
  });

  return (
    <App {...f7params}>
      <Panel left cover>
        <View>
          <Page>
            <Navbar title="Meny!" />
            <List strong outlineIos dividersIos insetMd accordionList>
              <ListItem title="Start" />
              {/* <ListItem accordionItem accordionItemOpened title="Filter">
                <AccordionContent></AccordionContent>
              </ListItem> */}
              <ListItem title="Bakgrundskarta" />
              <ListItem title="Jämfört kartor" />
              <ListItem title="Om AudioGuiden" />
              <ListItem title="Skriv ut" />
              <ListItem title="Dela" />
            </List>
          </Page>
        </View>
      </Panel>

      {/* Right panel with reveal effect*/}
      <Panel right reveal dark>
        <View>
          <Page>
            <Navbar title="Filtrera" />
            <List>
              {Array.from(store.state.availableCategories).map((c, i) => {
                return (
                  <ListItem
                    checkbox
                    defaultChecked
                    key={i}
                    title={c}
                    name="categories"
                  />
                );
              })}
            </List>
          </Page>
        </View>
      </Panel>
      <View main className="safe-areas" url="/" olMap={olMap} />
    </App>
  );
};
export default MyApp;
