import React from "react";

import { f7, f7ready, App, View, Panel } from "framework7-react";

import routes from "../js/routes";
import store from "../js/store";

import { enableGeolocation, initOLMap } from "../js/olMap.js";
import DemoMessageSheet from "./DemoMessageSheet";

const Audioguide = () => {
  console.log("Audioguide renders");

  const f7params = {
    name: "AudioGuide",
    theme: "auto",
    store: store,
    routes: routes,
  };

  f7ready(async () => {
    // Let's initiate the OL map. It will read the store
    // value that we just set, so it's important it comes
    // afterwards. We also pass on the f7 so that we can use
    // its event bus for sending events between the Map and F7's UI.
    await initOLMap(f7);

    enableGeolocation();

    // Let's tell the store (and React Components using
    // the useStore hook) that we're done initiating.
    store.dispatch("setLoading", false);
    console.log("APP INIT DONE, current state", store.state);
  });

  return (
    <App {...f7params}>
      {store.state.appConfig.showDemoMessage === true && <DemoMessageSheet />}
      <Panel left cover visibleBreakpoint={960}>
        <View url="/panel-left/" />
      </Panel>

      <Panel right reveal>
        <View url="/panel-right/" />
      </Panel>

      <View url="/" main className="safe-areas" />
    </App>
  );
};
export default Audioguide;
