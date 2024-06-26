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
  Popover,
  List,
  ListItem,
} from "framework7-react";

import GuidePreviewSheet from "../components/GuidePreviewSheet";
import GuideSheet from "../components/GuideSheet";
import BackgroundLayersActionsGrid from "../components/BackgroundLayersActionsGrid";
import TabListViewContent from "../components/TabListViewContent";
import TabShortListViewContent from "../components/TabShortListViewContent";

import { handleShowAllGuides } from "../js/f7Helpers";
import { updateFeaturesInMap } from "../js/openlayers/olMap";
import { info } from "../js/logger";
import { getI18n, useTranslation } from "react-i18next";

const HomePage = () => {
  const { t } = useTranslation("tabbar");
  info("[home.tsx] F7 is: ", f7);
  const i18n = getI18n();
  const { availableLanguages } = f7.store.getters.appConfig.value;
  const notificationFull = useRef(null);

  const showNotificationFull = () => {
    // Create toast
    if (!notificationFull.current) {
      notificationFull.current = f7.notification.create({
        icon: '<i class="icon f7-icons">xmark_octagon_fill</i>',
        title: i18n.t("appName", { ns: "common" }),
        titleRightText: i18n.t("now", { ns: "common" }),
        subtitle: i18n.t("title", { ns: "loadError" }),
        text: i18n.t("message", { ns: "loadError" }),
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
          <Link className="app-logo no-padding" onClick={handleShowAllGuides}>
            <img src="navbar-logo.svg" />
          </Link>
        </NavTitle>
        <NavRight>
          <Link
            iconF7="globe"
            popoverOpen=".popover-menu"
            text={i18n.resolvedLanguage?.toUpperCase()}
          />
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
          onClick={() => {
            // The `tabLink` prop will ensure that the #tab-list is
            // active. But we want also ensure that it's scrolled up
            // all the way to the top.
            const tabList = document.getElementById("tab-list");
            if (tabList?.scrollTop) {
              tabList.scrollTop = 0;
            }
          }}
          text={t("list")}
          iconIos="f7:list_bullet_below_rectangle"
          iconMd="material:ballot"
        />

        <Link
          tabLink="#tab-short-list"
          onClick={() => {
            const tabShortList = document.getElementById("tab-short-list");
            if (tabShortList?.scrollTop) {
              tabShortList.scrollTop = 0;
            }
          }}
          text={t("shortList")}
          iconIos="f7:list_bullet"
          iconMd="material:list"
        />

        <Link
          tabLink="#tab-map"
          text={t("map")}
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

      <Popover className="popover-menu">
        <List dividersIos outlineIos strongIos>
          {availableLanguages.map(
            ({ lang, flag }: { lang: string; flag: string }, i: number) => (
              <ListItem
                key={i}
                title={t(lang)}
                link
                style={{
                  backgroundColor:
                    i18n.resolvedLanguage === lang
                      ? "var(--f7-menu-list-item-selected-bg-color)"
                      : "unset",
                }}
                onClick={() => {
                  i18n.changeLanguage(lang);
                  f7.popover.close(".popover-menu");
                }}
              >
                <span className={`fi fi-${flag}`} slot="media"></span>
              </ListItem>
            )
          )}
        </List>
      </Popover>

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
