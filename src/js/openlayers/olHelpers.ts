// HELPER: Given a flat object, this will extract object's keys and its type and return a nice string, ready for TS.
// Object.entries(temp1).map(k => {return `${[k[0]]}: ${typeof k[1]}`}).join(";")

import TileLayer from "ol/layer/Tile";
import TileWMS, { Options as TileWMSOptions } from "ol/source/TileWMS";
import WMTS, { Options as WMTSOptions } from "ol/source/WMTS";
import TileGrid from "ol/tilegrid/TileGrid";
import WMTSTileGrid from "ol/tilegrid/WMTS";

import { LayerConfig, LayerType, MapConfig } from "../../types/types";

function createWMSLayer(
  cl: LayerConfig,
  mapConfig: MapConfig,
  layerType: LayerType
) {
  const sourceOpts: TileWMSOptions = {
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

  return new TileLayer({
    lid: cl.id, // Layer ID
    layerType: layerType, // "background", "layer" or "system"
    caption: cl.caption,
    opacity: cl.opacity,
    source: new TileWMS(sourceOpts),
    url: cl.url,
    visible: cl.visibleAtStart,
    zIndex: cl.zIndex,
  });
}

function createWMTSLayer(cl: LayerConfig, layerType: LayerType) {
  const tileGrid = new WMTSTileGrid({
    origins: cl.origins!.map((o) => o.map(Number)),
    resolutions: cl.resolutions!.map(Number),
    matrixIds: cl.matrixIds!,
    sizes: cl.sizes,
    tileSize: cl.tileSize,
  });

  const sourceOpts: WMTSOptions = {
    url: cl.url,
    layer: cl.layer!,
    matrixSet: cl.matrixSet!,
    style: cl.style!,
    format: cl.imageFormat,
    projection: cl.projection,
    // The config's own "KVP_TEMPLATE" label is a Hajk/GeoWebCache term for a
    // URL that's already a template with placeholder tokens, which is what
    // OL's "REST" encoding replaces per-tile. Only a literal "KVP" means OL
    // should build the query string itself.
    requestEncoding: cl.requestEncoding === "KVP" ? "KVP" : "REST",
    dimensions: cl.dimensions,
    attributions: cl.attribution,
    tileGrid,
  };

  return new TileLayer({
    lid: cl.id, // Layer ID
    layerType: layerType, // "background", "layer" or "system"
    caption: cl.caption,
    opacity: cl.opacity,
    source: new WMTS(sourceOpts),
    visible: cl.visibleAtStart,
    zIndex: cl.zIndex,
  });
}

function createLayersFromConfig(
  c: LayerConfig[],
  mapConfig: MapConfig,
  layerType: LayerType
) {
  return c.map((cl) =>
    cl.type === "wmtslayers"
      ? createWMTSLayer(cl, layerType)
      : createWMSLayer(cl, mapConfig, layerType)
  );
}

export { createLayersFromConfig };
