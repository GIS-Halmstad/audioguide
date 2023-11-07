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
  List,
  ListItem,
  NavLeft,
  NavRight,
} from "framework7-react";

const HomePage = () => {
  const loading = useStore("loading");
  const allLines = useStore("selectedLines");
  console.log("new allLines: ", allLines);

  return (
    <Page pageContent={false} name="home">
      <Navbar sliding={false}>
        <NavLeft>
          <Link iconIos="f7:menu" iconMd="material:menu" panelOpen="left" />
        </NavLeft>
        <NavTitle sliding>{loading ? "Laddar…" : "Audioguider"}</NavTitle>
        <NavRight>
          <Link
            iconIos="f7:sidebar_right"
            iconMd="f7:sidebar_right"
            panelOpen="right"
          />
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
          {Array.from(allLines).map((c, i) => {
            return (
              <Card
                key={i}
                outline
                title={c.get("title")}
                content={c.get("text")}
                footer={c.get("length")}
              />
            );
          })}
        </Tab>
      </Tabs>
    </Page>
  );
};
export default HomePage;
