import React from "react";
import { f7, Page, Navbar, Block, Button } from "framework7-react";
import { copyToClipboard } from "../js/utils";

const Share = () => (
  <Page>
    <Navbar title="Dela länk" backLink="Tillbaka"></Navbar>
    <Block>
      <p>
        Du kan kopiera länken till Audioguiden till urklipp på din enhet för att
        sedan kunna klistra in det i exempelvis ett meddelande.
      </p>
    </Block>
    <Block>
      <Button
        fill
        large
        onClick={() => copyToClipboard(window.location.href, f7.dialog.alert)}
      >
        Kopiera länk
      </Button>
    </Block>
  </Page>
);

export default Share;
