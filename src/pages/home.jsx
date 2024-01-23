import React, { useEffect, useRef, useState } from "react";
import {
  f7,
  Page,
  Navbar,
  NavTitle,
  Link,
  Toolbar,
  Tabs,
  Tab,
  useStore,
  NavLeft,
  NavRight,
  Fab,
  Icon,
} from "framework7-react";

import { getParamValueFromHash } from "../js/getParamValueFromHash";

import GuidePreviewSheet from "../components/GuidePreviewSheet";
import GuideSheet from "../components/GuideSheet";
import BackgroundLayersActionsGrid from "../components/BackgroundLayersActionsGrid";
import TabListViewContent from "../components/TabListViewContent";
import TabShortListViewContent from "../components/TabShortListViewContent";

const HomePage = () => {
  console.log("HomePage init: ", f7);
  const notificationFull = useRef(null);

  const showNotificationFull = () => {
    // Create toast
    if (!notificationFull.current) {
      notificationFull.current = f7.notification.create({
        icon: '<i class="icon f7-icons">xmark_octagon_fill</i>',
        title: "Audioguide",
        titleRightText: "nu",
        subtitle: "Laddningsfel",
        text: "Ett fel uppstod. Vi ber om ursäkt för det inträffade.",
      });
    }
    // Open it
    notificationFull.current.open();
  };

  // useStore hook where we need reactivity.
  const loadingError = useStore("loadingError");
  const geolocationError = useStore("geolocationError");

  // Needed to determine an accurate title for the navbar.
  const loading = useStore("loading");
  const activeGuideObject = useStore("activeGuideObject");
  const activeStopNumber = useStore("activeStopNumber");

  // Controls the visibility of the background layer switcher.
  const [backgroundLayersActionsGrid, setBackgroundLayersActionsGrid] =
    useState(false);

  useEffect(() => {
    loadingError !== null && showNotificationFull();
  }, [loadingError]);

  // Set title based on activeGuideObject or loading.
  const [navbarTitle, setNavbarTitle] = useState("Laddar…");
  useEffect(() => {
    if (loading) {
      setNavbarTitle("Laddar…");
    } else if (activeGuideObject && activeStopNumber) {
      setNavbarTitle(
        `${activeGuideObject.line.get("title")} - ${activeStopNumber} av ${
          Object.entries(activeGuideObject.points).length
        }`
      );
    } else {
      setNavbarTitle("Audioguide");
    }
  }, [activeGuideObject, activeStopNumber, loading]);

  // Check if app was launched with pid and/or gid params.
  // If so, let's pre-select the point or guide feature.
  useEffect(() => {
    const gid = Number(getParamValueFromHash("g")[0]);
    const pid = Number(getParamValueFromHash("p")[0]);

    // Let's start with an empty Array, which is the expected
    // format for a collection of OL Features (even though we'll
    // be sending out only one Feature at most, we still use the Array).
    let preSelectedFeature = [];

    // Check for a gid (guide ID)
    if (!Number.isNaN(gid)) {
      // If there's a gid, let's check for a PID (point ID)
      if (!Number.isNaN(pid)) {
        // If a specific point has been requested, let's pre-select it.
        preSelectedFeature = f7.store.state.allPoints.filter(
          (p) => p.get("guideId") === gid && p.get("stopNumber") === pid
        );
      } else {
        // Else if there's a gid but no pid, it means that
        // a whole guide has been requested.
        preSelectedFeature = f7.store.state.allLines.filter(
          (l) => l.get("guideId") === gid
        );
      }

      // If the filtering of Features resulted in a match…
      if (preSelectedFeature.length !== 0) {
        // …let's tell the rest of the App that we want to
        // pre-select a feature…
        f7.emit("olFeatureSelected", preSelectedFeature);

        // …and switch to the map tab.
        f7.tab.show("#tab-map");
      }
    }
  }, []);

  const onPageBeforeOut = () => {
    f7.notification.close();
  };

  const onPageBeforeRemove = () => {
    // Destroy toasts when page removed
    if (notificationFull.current) notificationFull.current.destroy();
  };

  const handleClickOnFabBackgrounds = () => {
    setBackgroundLayersActionsGrid(true);
  };

  const handleClickOnGeolocation = () => {
    if (geolocationError === null) {
      f7.emit("olCenterOnGeolocation");
    } else {
      f7.dialog.alert(
        "För att använda funktionen måste du tillåta appen att ta del av din position.",
        "Kan inte positionera"
      );
    }
  };

  return (
    <Page
      pageContent={false}
      name="home"
      onPageBeforeOut={onPageBeforeOut}
      onPageBeforeRemove={onPageBeforeRemove}
    >
      <Navbar sliding={false}>
        <NavLeft>
          <Link iconF7="menu" iconMaterial="menu" panelOpen="left" iconOnly />
        </NavLeft>
        <NavTitle sliding>{navbarTitle}</NavTitle>
        <NavRight>
          <Link
            iconIos="f7:funnel"
            iconMd="material:filter_alt"
            panelOpen="right"
            iconOnly
          />
        </NavRight>
      </Navbar>

      <Toolbar tabbar icons bottom>
        <Link
          tabLink="#tab-list"
          tabLinkActive
          text="Bildlista"
          iconIos="f7:list_bullet_below_rectangle"
          iconMd="material:ballot"
        />

        <Link
          tabLink="#tab-short-list"
          text="Lista"
          iconIos="f7:list_bullet"
          iconMd="material:list"
        />

        <Link
          tabLink="#tab-map"
          text="Karta"
          iconIos="f7:map"
          iconMd="material:map"
        />
      </Toolbar>

      <GuidePreviewSheet />
      <GuideSheet />
      <BackgroundLayersActionsGrid
        backgroundLayersActionsGrid={backgroundLayersActionsGrid}
        setBackgroundLayersActionsGrid={setBackgroundLayersActionsGrid}
      />

      <Tabs>
        <Tab id="tab-list" className="page-content" tabActive>
          <TabListViewContent />
        </Tab>
        <Tab id="tab-short-list" className="page-content">
          <TabShortListViewContent />
        </Tab>
        <Tab id="tab-map" className="page-content">
          <div id="map" />
          <Fab position="right-top" onClick={handleClickOnFabBackgrounds}>
            <Icon ios="f7:layers" md="material:layers" />
          </Fab>
          <Fab position="left-top" onClick={handleClickOnGeolocation}>
            <Icon ios="f7:location" md="material:near_me" />
          </Fab>
        </Tab>
      </Tabs>
    </Page>
  );
};
export default HomePage;
