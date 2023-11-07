import React from "react";
import {
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
} from "framework7-react";

const GuidesPage = () => {
  return (
    <Page name="guides">
      <Navbar title="Alla guider" />
      <Block>List will come</Block>
      <Toolbar bottom>
        <Link href="/">Karta</Link>
        <Link href="/guides/">Lista</Link>
      </Toolbar>
    </Page>
  );
};
export default GuidesPage;
