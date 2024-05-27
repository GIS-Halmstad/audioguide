import React from "react";
import { Actions, ActionsButton, ActionsGroup, f7 } from "framework7-react";

import { getLayerVisibility, setBackgroundLayer } from "../js/openlayers/olMap";

import { LayerConfig } from "../types/types";
import { useTranslation } from "react-i18next";

function LayerButton({ layer }) {
  const { t } = useTranslation("layerNames");
  const isActive = getLayerVisibility(layer.id);

  return (
    <ActionsButton onClick={() => setBackgroundLayer(layer.id)}>
      <img
        slot="media"
        src={`backgroundThumbs/${layer.id}.webp`}
        width="48"
        style={{
          maxWidth: "100%",
          borderRadius: "8px",
          ...(isActive && {
            borderColor: "var(--f7-md-outline)",
            borderStyle: "solid",
          }),
        }}
      />
      {isActive ? <b>{t(layer.caption)}</b> : <span>{t(layer.caption)}</span>}
    </ActionsButton>
  );
}

function BackgroundLayersActionsGrid({
  backgroundLayersActionsGrid,
  setBackgroundLayersActionsGrid,
}) {
  const backgrounds: LayerConfig[] = f7.store.state.mapConfig.backgrounds;

  // Ensure we filter out any undefined values
  const filteredBackgrounds = backgrounds.filter((b) => b !== undefined);

  // Split backgrounds into slots of three items per slot.
  const slots: LayerConfig[][] = [];
  for (let i = 0; i < filteredBackgrounds.length; i += 3) {
    slots.push(filteredBackgrounds.slice(i, i + 3));
  }

  return (
    <Actions
      grid={true}
      opened={backgroundLayersActionsGrid}
      onActionsClosed={() => setBackgroundLayersActionsGrid(false)}
      className="background-layers-actions-grid"
    >
      {slots.map((slot, i) => {
        return (
          <ActionsGroup key={i}>
            {slot.map((b, i) => {
              return <LayerButton key={i} layer={b} />;
            })}
          </ActionsGroup>
        );
      })}
    </Actions>
  );
}

export default BackgroundLayersActionsGrid;
