import React, { useState } from "react";
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
  Panel,
  View,
} from "framework7-react";

const HomePage = () => {
  // useStore hook where we need reactivity
  const loading = useStore("loading");
  const selectedLines = useStore("selectedLines");
  const selectedCategories = useStore("selectedCategories");

  const handleCategoryChange = (e) => {
    const { name, checked } = e.target;
    if (checked === true && !selectedCategories.includes(name)) {
      // We must use the spread syntax, rather than push, in order
      // not to mutate the selectedCategories itself. (Same as for React's State.)
      f7.store.dispatch("setSelectedCategories", [...selectedCategories, name]);
    } else if (
      checked === false &&
      selectedCategories.includes(e.target.name)
    ) {
      // The .filter() method returns a new Array, which we want
      // in order to keep the store reactive.
      f7.store.dispatch(
        "setSelectedCategories",
        selectedCategories.filter((el) => el !== name)
      );
    } else {
      console.warn("SHOULD NOT SHOW");
    }
  };

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

      <Panel left cover>
        <View>
          <Page>
            <Navbar title="Meny" />
            <List strong outlineIos dividersIos insetMd accordionList>
              <ListItem title="Start" />
              {/* <ListItem accordionItem accordionItemOpened title="Filter">
                <AccordionContent></AccordionContent>
              </ListItem> */}
              <ListItem title="Bakgrundskarta" />
              <ListItem title="Jämfört kartor" />
              <ListItem title="Om AudioGuiden" />
              <ListItem title="Skriv ut" />
              <ListItem title="Dela" />
            </List>
          </Page>
        </View>
      </Panel>

      <Panel right reveal opened>
        <View>
          <Page>
            <Navbar title="Filtrera" />
            <List outlineIos strongMd strongIos>
              {f7.store.state.allCategories.map((c, i) => {
                return (
                  <ListItem
                    key={i}
                    checkbox
                    checked={selectedCategories.includes(c)}
                    onChange={handleCategoryChange}
                    title={c}
                    name={c}
                  />
                );
              })}
            </List>
          </Page>
        </View>
      </Panel>

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
          {Array.from(selectedLines).map((c, i) => {
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
