import React from "react";

import { Block, BlockTitle, Sheet, useStore } from "framework7-react";

function DemoMessageSheet() {
  const loading = useStore("loading");
  return (
    <Sheet
      opened={loading === false}
      className="demo-sheet-swipe-to-close"
      style={{ height: "auto" }}
      swipeToClose
      push
      backdrop
    >
      <div className="swipe-handler"></div>
      <div>
        <BlockTitle>Detta är ett demo</BlockTitle>
        <Block>Hej och välkommen till Audioguide!</Block>
        <Block>
          Observera att det du ser är en mycket tidig demoversion av produkten
          där ingenting är klart. Du kommer att upptäcka konstigheter, saker och
          ting kommer att bete sig annorlunda än väntat och funktioner kommer
          saknas.
        </Block>
        <Block>
          Det här meddelandet kommer visas varje gång appen startar.
        </Block>
      </div>
    </Sheet>
  );
}

export default DemoMessageSheet;
