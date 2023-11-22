import React from "react";
import { Actions, ActionsButton, ActionsGroup, f7 } from "framework7-react";

import { getLayerVisibility, setBackgroundLayer } from "../js/olMap";

function LayerButton({ layer }) {
  const isActive = getLayerVisibility(layer.id);

  return (
    <ActionsButton onClick={() => setBackgroundLayer(layer.id)}>
      <img
        slot="media"
        src={`backgroundThumbs/${layer.id}.webp`}
        width="48"
        style={{
          maxWidth: "100%",
          ...(isActive && {
            borderRadius: "8px",
            borderColor: "gray",
            borderStyle: "solid",
          }),
        }}
      />
      {isActive ? <b>{layer.caption}</b> : <span>{layer.caption}</span>}
    </ActionsButton>
  );
}

function BackgroundLayersActionsGrid({
  backgroundLayersActionsGrid,
  setBackgroundLayersActionsGrid,
}) {
  const backgrounds = f7.store.state.mapConfig.backgrounds;

  // We have only room for 6 layers in slots of 3 layers each.
  const slot1 = [backgrounds[0], backgrounds[1], backgrounds[2]].filter(
    (e) => e !== undefined
  );
  // const slot2 = [backgrounds[3], backgrounds[4], backgrounds[5]].filter(
  //   (e) => e !== undefined
  // );

  return (
    <Actions
      grid={true}
      opened={backgroundLayersActionsGrid}
      onActionsClosed={() => setBackgroundLayersActionsGrid(false)}
    >
      <ActionsGroup>
        {slot1.map((b, i) => {
          return <LayerButton key={i} layer={b} />;
        })}
      </ActionsGroup>
      {/* <ActionsGroup>
        {slot2.map((b, i) => {
          return <LayerButton key={i} layer={b} />;
        })}
      </ActionsGroup> */}
    </Actions>
  );
}

export default BackgroundLayersActionsGrid;
