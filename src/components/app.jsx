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
} from "framework7-react";

import routes from "../js/routes";
import store from "../js/store";

import { initOLMap, getOLMap } from "../js/olMap.js";

const MyApp = () => {
  console.log("MyApp renders");

  let olMap;
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

    // Let's initiate the OL map. It will read the store
    // value that we just set, so it's important it comes
    // afterwards.
    initOLMap();

    // Let's tell the store (and React Components using
    // the useStore hook) that we're done initiating.
    store.dispatch("setLoading", false);
    console.log("APP INIT DONE");
  });

  return (
    <App {...f7params}>
      <View main className="safe-areas" url="/" olMap={olMap} />
    </App>
  );
};
export default MyApp;
