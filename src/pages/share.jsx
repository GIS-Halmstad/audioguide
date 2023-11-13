import React from "react";
import { Page, Navbar, Block, BlockTitle, Button } from "framework7-react";

const copyToClipboard = () => {
  const blobText = new Blob([window.location.href], {
    type: "text/plain",
  });

  const data = [
    new ClipboardItem({
      "text/plain": blobText,
    }),
  ];

  navigator.clipboard.write(data).then(
    () => {
      alert("Adressen har kopierats till urklipp");
    },
    () => {}
  );
};

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
      <Button large onClick={copyToClipboard}>
        Kopiera till urklipp
      </Button>
    </Block>
  </Page>
);

export default Share;
