// HELPER: Given a flat object, this will extract object's keys and its type and return a nice string, ready for TS.
// Object.entries(temp1).map(k => {return `${[k[0]]}: ${typeof k[1]}`}).join(";")

import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";

type LayerConfig = {
  type: string;
  id: string;
  caption: string;
  internalLayerName: string;
  url: string;
  customGetMapUrl: string;
  owner: string;
  date: string;
  content: string;
  legend: string;
  legendIcon: string;
  projection: string;
  layers: string[];
  layersInfo: object;
  searchFields: object;
  displayFields: object;
  visibleAtStart: boolean;
  tiled: boolean;
  showAttributeTableButton: boolean;
  opacity: number;
  maxZoom: number;
  minZoom: number;
  minMaxZoomAlertOnToggleOnly: boolean;
  singleTile: boolean;
  hidpi: boolean;
  useCustomDpiList: boolean;
  customDpiList: object;
  customRatio: number;
  imageFormat: string;
  serverType: string;
  attribution: string;
  searchUrl: string;
  searchPropertyName: string;
  searchDisplayName: string;
  secondaryLabelFields: string;
  searchShortDisplayName: string;
  searchOutputFormat: string;
  searchGeometryField: string;
  infoVisible: boolean;
  infoTitle: string;
  infoText: string;
  infoUrl: string;
  infoUrlText: string;
  infoOwner: string;
  timeSliderVisible: boolean;
  timeSliderStart: string;
  timeSliderEnd: string;
  version: string;
  infoFormat: string;
  infoClickSortProperty: string;
  infoClickSortDesc: boolean;
  infoClickSortType: string;
  hideExpandArrow: boolean;
  zIndex: number;
  drawOrder: number;
  infobox: string;
};

function createLayersFromConfig(c: LayerConfig[]) {
  return c.map((cl) => {
    console.log("cl: ", cl);
    return new TileLayer({
      lid: cl.id, // Layer ID
      layerType: "background", // "background", "layer" or "system"
      caption: cl.caption,
      source: new TileWMS({
        attributions: cl.attribution,
        hidpi: cl.hidpi,
        params: {
          LAYERS: cl.layers.join(","),
          FORMAT: cl.imageFormat,
          INFO_FORMAT: cl.infoFormat,
          VERSION: cl.version || "1.1.1",
          // [srsOrCrs]: projection || "EPSG:3006",
          TILED: cl.tiled,
          STYLES: Array.isArray(cl.layersInfo)
            ? cl.layersInfo.map((l) => l.style || "").join(",")
            : null,
        },
        projection: cl.projection,
        url: cl.url,
        serverType: cl.serverType,
      }),
      url: cl.url,
      visible: cl.visibleAtStart,
      zIndex: cl.zIndex,
    });
  });
}

export { createLayersFromConfig };
