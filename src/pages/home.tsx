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
} from "framework7-react";

import { getParamValueFromHash } from "../js/getParamValueFromHash";

import GuidePreviewSheet from "../components/GuidePreviewSheet";
import GuideSheet from "../components/GuideSheet";
import BackgroundLayersActionsGrid from "../components/BackgroundLayersActionsGrid";
import TabListViewContent from "../components/TabListViewContent";
import TabShortListViewContent from "../components/TabShortListViewContent";

import { handleShowAllGuides, handleShowGuideInMap } from "../js/f7Helpers";
import { updateFeaturesInMap } from "../js/openlayers/olMap";
import { info } from "../js/logger";

const HomePage = () => {
  info("[home.tsx] F7 is: ", f7);
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
  useEffect(() => {
    loadingError !== null && showNotificationFull();
  }, [loadingError]);

  // Controls the visibility of the background layer switcher.
  const [backgroundLayersActionsGrid, setBackgroundLayersActionsGrid] =
    useState(false);

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

      // If the filtering of Features resulted in a match, show guide in map.
      if (preSelectedFeature.length !== 0) {
        // Add a slight delay to ensure correct animation in Map.
        handleShowGuideInMap(preSelectedFeature[0], 600);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOnFabBackgrounds = () => {
      setBackgroundLayersActionsGrid(true);
    };
    f7.on("showBackgroundSwitcher", handleClickOnFabBackgrounds);

    return () => {
      f7.off("showBackgroundSwitcher", handleClickOnFabBackgrounds);
    };
  }, []);

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
      <Navbar sliding={false}>
        <NavLeft>
          <Link iconF7="menu" iconMaterial="menu" panelOpen="left" iconOnly />
        </NavLeft>
        <NavTitle>
          <Link className="app-logo no-padding " onClick={handleShowAllGuides}>
            <img src="navbar-logo.svg" />
          </Link>
        </NavTitle>
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
          onClick={updateFeaturesInMap}
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
        </Tab>
      </Tabs>
    </Page>
  );
};
export default HomePage;
