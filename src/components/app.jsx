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
} from "framework7-react";

import routes from "../js/routes";
import store from "../js/store";

import { initOLMap, getOLMap } from "../js/olMap.js";

const MyApp = () => {
  let olMap;
  // Framework7 Parameters
  const f7params = {
    name: "AudioGuide", // App name
    theme: "auto", // Automatic theme detection

    // App store
    store: store,
    // App routes
    routes: routes,
  };

  f7ready(() => {
    initOLMap();
    console.log("olMap: ", getOLMap());
  });

  return (
    <App {...f7params}>
      <View main className="safe-areas" url="/" olMap={olMap} />
    </App>
  );
};
export default MyApp;
