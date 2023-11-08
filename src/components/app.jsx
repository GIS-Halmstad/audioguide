import React from "react";

import { f7ready, App, View } from "framework7-react";

import routes from "../js/routes";
import store from "../js/store";

import { initOLMap } from "../js/olMap.js";

const MyApp = () => {
  console.log("MyApp renders");

  const f7params = {
    name: "AudioGuide",
    theme: "auto",
    store: store,
    routes: routes,
  };

  f7ready(async () => {
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
      <View main className="safe-areas" url="/" />
    </App>
  );
};
export default MyApp;
