import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getDevice } from "framework7/lite/bundle";
import {
  App,
  BlockFooter,
  f7ready,
  List,
  LoginScreenTitle,
  Page,
  Panel,
  Popup,
  View,
} from "framework7-react";
import Framework7, { Framework7Parameters } from "framework7/types";

import { Feature } from "ol";

import capacitorApp from "../js/capacitor-app";
import routes from "../js/routes";
import store from "../js/store";

import { activateGuide, initOLMap } from "../js/openlayers/olMap";
import { getParamValueFromHash } from "../js/getParamValueFromHash";
import { handleShowGuideInMap } from "../js/f7Helpers";
import { preventAndroidBackButton } from "../js/utils";
import { info, log, warn } from "../js/logger";

import DemoMessageSheet from "./DemoMessageSheet";
import FullscreenSwiper from "./FullscreenSwiper";

const Audioguide = () => {
  info("[App.tsx] App renders");
  const { t } = useTranslation("rotationUnsupported");
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

  const initiateWithHashParams = async (f7: Framework7) => {
    // Check if app was launched with pid and/or gid params.
    // If so, let's pre-select the point or guide feature.
    const gid = Number(getParamValueFromHash("g")[0]);

    // If there's no gid, let's bail out.
    if (Number.isNaN(gid)) {
      return;
    }

    // If there's a gid, let's check for a pid. Note that this could
    // be undefined and it is expected at this stage.
    const pid = Number(getParamValueFromHash("p")[0]);

    // Let's ensure that the line and point features that are
    // requested really exist by attempting to pre-select them.
    //
    // Start with an empty Array, which is the expected
    // format for a collection of OL Features (even though we'll
    // be sending only one Feature at most, we still use the Array).
    let preSelectedFeature = [];

    // If a specific point has been requested, using PID, let's pre-select it.
    if (!Number.isNaN(pid)) {
      preSelectedFeature = f7.store.state.allPoints.filter(
        (p: Feature) => p.get("guideId") === gid && p.get("stopNumber") === pid
      );
    } else {
      // Else if there's a GID but no PID, it means that
      // the whole guide has been requested.
      preSelectedFeature = f7.store.state.allLines.filter(
        (l: Feature) => l.get("guideId") === gid
      );
    }

    // We should always have at least one pre-selected feature.
    if (preSelectedFeature.length < 1) {
      warn(
        `Could not pre-select guide/stop using the supplied parameters. gid: ${gid}, pid: ${pid}. Starting without any pre-selection.`
      );
      return;
    }

    // Let's start if we should start with guide activated or just a preview.
    const startWithActiveGuide = Number(getParamValueFromHash("a")[0]) === 1;

    // From now on, there are two ways the program flow can take:
    //  - launch a specific point in a specific guide in _active_ mode, or
    //  - launch specific guide (and optionally specific point) in _preview_ mode.
    // Which mode it is in depends on the value of startWithActiveGuide, which in
    // its turn is read from the 'a' query hash parameter.
    if (startWithActiveGuide === true) {
      // Let's add a delay to allow for animation in Map.
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Then, switch to the map tab.
      f7.tab.show("#tab-map");

      // Finally, let's activate the guide. If pid is NaN, let's activate
      // on the first point in guide.
      activateGuide(gid, pid || 1);
    } else {
      // We got here because startWithActive was false. It means that
      // we should launch the application in preview mode, with a specific
      // guide (and optionally a specific point) selected.
      handleShowGuideInMap(preSelectedFeature[0], 600);
    }
  };

  const __init = async (f7: Framework7) => {
    warn("[App.tsx] f7ready (should only run once)");
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

    preventAndroidBackButton(f7);

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

    // See if we need to inject custom CSS
    if (store.state.mapConfig.ui.injectCustomCss === true) {
      const customCssResponse = await fetch("custom.css");
      const customCss = await customCssResponse.text();
      const styleTag = document.createElement("style");
      styleTag.innerHTML = customCss;
      document.head.appendChild(styleTag);
    }

    // Let's tell the store (and React Components using
    // the useStore hook) that we're done initiating.
    store.dispatch("setLoading", false);
    store.dispatch("trackAnalyticsEvent", {
      eventName: "loadSuccess",
    });

    // Let's set the correct CSS geolocation status class
    document
      .querySelector("html")
      ?.classList.add(`has-geolocation-${store.state.geolocationStatus}`);

    // Check for start parameters in URLs hash query
    initiateWithHashParams(f7);

    // Unset the hash query parameters, if there are any
    if (window.location.hash) {
      window.location.hash = "";
    }

    log("[App.tsx] App init done. Store is:", store.state);
  };

  // The main "constructor" for this component. Runs once, sets
  // up the
  useEffect(() => {
    warn("[App.tsx] useEffect subscribe (should only run once)");

    f7ready(async (f7) => {
      __init(f7);
    });
  }, []);

  const f7params: Framework7Parameters = {
    name: store.state.mapConfig.ui?.name || "Audioguide",
    darkMode: store.state.mapConfig.ui?.darkMode ?? "auto", // can be true, false or "auto"
    theme: store.state.mapConfig.ui?.theme || "auto",
    colors: store.state.mapConfig.ui?.colors || {},
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
      buttonOk: t("buttonOk", { ns: "common" }),
      buttonCancel: t("buttonCancel", { ns: "common" }),
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
      <Popup
        id="orientation-unsupported"
        opened={orientationUnsupported}
        style={{ zIndex: 12600 }} /* Ensure it shows above any Sheet dialogs */
      >
        <Page noToolbar noNavbar noSwipeback loginScreen>
          <LoginScreenTitle>{t("title")}</LoginScreenTitle>
          <List inset>
            <BlockFooter>
              <p>{t("message1")}</p>
              <p>{t("message2")}</p>
            </BlockFooter>
          </List>
        </Page>
      </Popup>

      <FullscreenSwiper />
    </App>
  );
};
export default Audioguide;
