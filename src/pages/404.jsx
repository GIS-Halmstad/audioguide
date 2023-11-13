import React from "react";
import { Page, Navbar, Block } from "framework7-react";

const NotFound = () => (
  <Page>
    <Navbar title="Hittas ej" backLink="Tillbaka"></Navbar>
    <Block>
      <p>Ojdå!</p>
      <p>
        Här var det något som gick fel. Vi ber om ursäkt för det inträffade.
      </p>
    </Block>
  </Page>
);

export default NotFound;
