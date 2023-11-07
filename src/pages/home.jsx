import React, { useEffect } from "react";
import {
  f7,
  Page,
  Navbar,
  NavTitle,
  NavTitleLarge,
  Link,
  Toolbar,
  Block,
  Button,
  Card,
  CardContent,
  CardHeader,
  Tabs,
  Tab,
  useStore,
} from "framework7-react";

const HomePage = () => {
  const loading = useStore("loading");

  return (
    <Page pageContent={false} name="home">
      <Navbar title={loading ? "Laddar…" : "Audioguider"} />
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
          <Block>Lista över guider</Block>
        </Tab>
      </Tabs>
    </Page>
  );
};
export default HomePage;
