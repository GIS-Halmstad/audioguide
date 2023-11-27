import React, { useEffect } from "react";

import { f7, f7ready, App, View, Panel } from "framework7-react";

import routes from "../js/routes.js";
import store from "../js/store.js";

import { enableGeolocation, initOLMap } from "../js/olMap.js";
import DemoMessageSheet from "./DemoMessageSheet.tsx";

const Audioguide = () => {
  console.log("Audioguide renders");

  useEffect(() => {
    // Fix viewport scale on mobiles
    if ((f7.device.ios || f7.device.android) && f7.device.standalone) {
      const viewPortContent = document
        .querySelector('meta[name="viewport"]')
        .getAttribute("content");
      document
        .querySelector('meta[name="viewport"]')
        .setAttribute(
          "content",
          `${viewPortContent}, maximum-scale=1, user-scalable=no`
        );
    }
  }, []);

  const f7params = {
    name: "AudioGuide",
    theme: "auto",
    store: store,
    routes: routes,
    autoDarkTheme: true,
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
