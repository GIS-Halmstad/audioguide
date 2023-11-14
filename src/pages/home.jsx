import React, { useEffect, useRef, useState } from "react";
import {
  f7,
  Page,
  Navbar,
  NavTitle,
  Link,
  Toolbar,
  Block,
  Tabs,
  Tab,
  useStore,
  NavLeft,
  NavRight,
} from "framework7-react";

import AudioGuideCard from "../components/AudioGuideCard";
import AudioGuideSheet from "../components/AudioGuideSheet";

const HomePage = () => {
  console.log("HomePage init: ", f7);
  const notificationFull = useRef(null);

  const showNotificationFull = () => {
    // Create toast
    if (!notificationFull.current) {
      notificationFull.current = f7.notification.create({
        icon: '<i class="icon f7-icons">xmark_octagon_fill</i>',
        title: "Audioguider",
        titleRightText: "nu",
        subtitle: "Laddningsfel",
        text: "Ett fel uppstod. Vi ber om ursäkt för det inträffade.",
      });
    }
    // Open it
    notificationFull.current.open();
  };

  // useStore hook where we need reactivity
  const loadingError = useStore("loadingError");
  const loading = useStore("loading");
  const selectedFeatures = useStore("selectedFeatures");

  const [selectedFeature, setSelectedFeature] = useState([]);

  useEffect(() => {
    console.log("USEEFFECT subscribe");
    f7.on("olFeatureSelected", (f) => {
      console.log("Got selected feature", f);
      setSelectedFeature(f);
    });

    return () => {
      console.log("USEEFFECT unsubscribe");
      f7.off("olFeatureSelected");
    };
  }, [f7, setSelectedFeature]);

  useEffect(() => {
    loadingError === true && showNotificationFull();
  }, [loadingError]);

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
      <AudioGuideSheet f={selectedFeature} />
      <Navbar sliding={false}>
        <NavLeft>
          <Link iconF7="menu" iconMaterial="menu" panelOpen="left" iconOnly />
        </NavLeft>
        <NavTitle sliding>{loading ? "Laddar…" : "Audioguider"}</NavTitle>
        <NavRight>
          <Link iconF7="sidebar_right" panelOpen="right" iconOnly />
        </NavRight>
      </Navbar>

      <Toolbar tabbar bottom>
        <Link tabLink="#tab-map" tabLinkActive>
          Karta
        </Link>
        <Link tabLink="#tab-list">Lista</Link>
      </Toolbar>

      <Tabs>
        <Tab id="tab-map" className="page-content" tabActive>
          <div id="map" />
        </Tab>
        <Tab id="tab-list" className="page-content">
          <Block>Välj bland följande tillgängliga guider:</Block>
          {selectedFeatures
            .filter((f) => f.get("length")) // Only line features will have the "length" property
            .map((c, i) => (
              <AudioGuideCard c={c} key={i} />
            ))}
        </Tab>
      </Tabs>
      {/* <LoadingErrorSheet opened={loadingError} /> */}
    </Page>
  );
};
export default HomePage;
