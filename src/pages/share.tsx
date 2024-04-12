import React from "react";
import { Page, Navbar, Block, Button } from "framework7-react";
import { handleCopyLinkToGuide } from "../js/f7Helpers";

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
      <Button fill large onClick={() => handleCopyLinkToGuide()}>
        Kopiera länk
      </Button>
    </Block>
  </Page>
);

export default Share;
