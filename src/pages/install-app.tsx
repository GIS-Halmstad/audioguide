import React from "react";
import { Page, Navbar, Block } from "framework7-react";

const InstallApp = ({ f7router }) => {
  let instructions = "";

  if (f7router.app.device.ios) {
    instructions =
      'För att installera appen från Safari på iOS trycker du på Dela-knappen (den kan se ut som en pil som pekar uppåt). I menyn som kommer fram väljer du "Lägg till på hemskrämen".';
  } else if (f7router.app.device.android) {
    instructions =
      'För att installera appen på Android behöver du välja din webbläsares meny och trycka på "Installera appen".';
  } else {
    instructions =
      'Titta i din webbläsare efter knappar så som "Dela", "Installera", eller "Lägg till på hemskärmen".';
  }
  return (
    <Page>
      <Navbar title="Installera appen" backLink="Tillbaka"></Navbar>
      <Block>
        <p>
          För att få en så bra upplevelse från möjligt i appen kan du installera
          den på din enhet.
        </p>
        <p>{instructions}</p>
      </Block>
    </Page>
  );
};

export default InstallApp;
