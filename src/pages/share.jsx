import React from "react";
import { Page, Navbar, Block, BlockTitle, Button } from "framework7-react";
import { copyToClipboard } from "../js/utils";

const Share = () => (
  <Page>
    <Navbar title="Dela länk" backLink="Tillbaka"></Navbar>
    <BlockTitle>Dela länk</BlockTitle>
    <Block>
      <p>
        Du kan kopiera länken till Audioguiden till urklipp på din enhet för att
        sedan kunna klistra in det i exempelvis ett meddelande.
      </p>
    </Block>
    <Block>
      <Button large onClick={() => copyToClipboard(window.location.href)}>
        Kopiera till urklipp
      </Button>
    </Block>
  </Page>
);

export default Share;
