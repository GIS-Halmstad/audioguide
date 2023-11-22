// HELPER: Given a flat object, this will extract object's keys and its type and return a nice string, ready for TS.
// Object.entries(temp1).map(k => {return `${[k[0]]}: ${typeof k[1]}`}).join(";")

import TileLayer from "ol/layer/Tile";
import TileWMS, { Options } from "ol/source/TileWMS";
import TileGrid from "ol/tilegrid/TileGrid";

import { LayerConfig, LayerType, MapConfig } from "../types/types";

function createLayersFromConfig(
  c: LayerConfig[],
  mapConfig: MapConfig,
  layerType: LayerType
) {
  return c.map((cl) => {
    const sourceOpts: Options = {
      attributions: cl.attribution,
      hidpi: cl.hidpi,
      params: {
        LAYERS: cl.layers.join(","),
        FORMAT: cl.imageFormat,
        INFO_FORMAT: cl.infoFormat,
        VERSION: cl.version || "1.1.1",
        TILED: cl.tiled,
        STYLES: Array.isArray(cl.layersInfo)
          ? cl.layersInfo.map((l) => l.style || "").join(",")
          : null,
      },
      projection: cl.projection,
      url: cl.url,
      serverType: cl.serverType,
      tileGrid: new TileGrid({
        resolutions: mapConfig.resolutions,
        origin: mapConfig.origin,
      }),
    };

    const tileWMSSource = new TileWMS(sourceOpts);
    return new TileLayer({
      lid: cl.id, // Layer ID
      layerType: layerType, // "background", "layer" or "system"
      caption: cl.caption,
      opacity: cl.opacity,
      source: tileWMSSource,
      url: cl.url,
      visible: cl.visibleAtStart,
      zIndex: cl.zIndex,
    });
  });
}

export { createLayersFromConfig };
