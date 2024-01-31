import React, { useEffect, useState } from "react";
import { getDevice } from "framework7/lite/bundle";
import {
  f7ready,
  App,
  View,
  Panel,
  Popup,
  Page,
  LoginScreenTitle,
  List,
  BlockFooter,
} from "framework7-react";
import Framework7, { Framework7Parameters } from "framework7/types";

import capacitorApp from "../js/capacitor-app";
import routes from "../js/routes";
import store from "../js/store";

import { enableGeolocation, initOLMap } from "../js/openlayers/olMap";
import DemoMessageSheet from "./DemoMessageSheet";

const Audioguide = () => {
  console.log("Audioguide renders");
  const device = getDevice();

  const [orientationUnsupported, setOrientationUnsupported] = useState(false);

  const isOrientationSupported = () => {
    // Ensure that the Screen Orientation API is supported
    if (window?.screen?.orientation?.type) {
      const {
        width,
        height,
        orientation: { type },
      } = window.screen;

      // If in any of the two landscape modes, let's look if _either_
      // width or height is smaller than 560px. The reason for we we can't
      // just look for height is that iOS seems to always call the greater
      // value "height", so in landscape mode the height is actually the
      // horizontal value. A bit unexpected, but that's the way it works.
      if (type.includes("landscape") && Math.min(width, height) < 560) {
        setOrientationUnsupported(true);
      } else {
        setOrientationUnsupported(false);
      }
    }
  };

  const __init = async (f7: Framework7) => {
    console.warn("f7ready should also only run once", f7);
    // Fix viewport scale on mobiles
    if ((f7.device.ios || f7.device.android) && f7.device.standalone) {
      const viewPortContent = document
        .querySelector('meta[name="viewport"]')
        ?.getAttribute("content");
      document
        .querySelector('meta[name="viewport"]')
        ?.setAttribute(
          "content",
          `${viewPortContent}, maximum-scale=1, user-scalable=no`
        );
    }

    // Init capacitor APIs (see capacitor-app.js)
    if (f7.device.capacitor) {
      capacitorApp.init(f7);
    }

    // Let's check if screen orientation is supported, else show a popup
    isOrientationSupported();

    // Listen for orientation changes and show a popup
    // if screen height is too small.
    window.addEventListener("orientationchange", isOrientationSupported);

    // Let's initiate the OL map. It will read the store
    // value that we just set, so it's important it comes
    // afterwards. We also pass on the f7 so that we can use
    // its event bus for sending events between the Map and F7's UI.
    await initOLMap(f7);

    // Let's enable geolocation
    enableGeolocation();

    // Let's tell the store (and React Components using
    // the useStore hook) that we're done initiating.
    store.dispatch("setLoading", false);
    store.dispatch("trackAnalyticsEvent", {
      eventName: "loadSuccess",
    });
    console.log("APP INIT DONE, current state", store.state);
  };

  // The main "constructor" for this component. Runs once, sets
  // up the
  useEffect(() => {
    console.warn("Should only run once");

    f7ready(async (f7) => {
      __init(f7);
    });
  }, []);

  const f7params: Framework7Parameters = {
    name: "Audioguide",
    theme: "auto",
    colors: {
      primary: store.state.mapConfig.app?.color || "#007aff", // Allow custom primary color, fallback to F7 default
    },
    store: store,
    routes: routes,
    // Input settings
    input: {
      // We can't use f7.device here as F7 hasn't been initialized yet
      scrollIntoViewOnFocus: device.capacitor,
      scrollIntoViewCentered: device.capacitor,
    },
    // Capacitor Statusbar settings
    statusbar: {
      iosOverlaysWebView: true,
      androidOverlaysWebView: false,
    },
    dialog: {
      buttonOk: "OK",
      buttonCancel: "Avbryt",
      autoFocus: true,
    },
  };

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

      {/* Unsupported Orientation Popup */}
      <Popup id="orientation-unsupported" opened={orientationUnsupported}>
        <Page noToolbar noNavbar noSwipeback loginScreen>
          <LoginScreenTitle>Rotera skärmen</LoginScreenTitle>
          <List inset>
            <BlockFooter>
              <p>
                För att Audioguiden ska fungera behöver du ha din skärm i
                stående läge.
              </p>
              <p>Rotera din enhet och fortsätt upptäcka Halmstad.</p>
            </BlockFooter>
          </List>
        </Page>
      </Popup>
    </App>
  );
};
export default Audioguide;
