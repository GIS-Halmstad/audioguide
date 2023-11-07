import "../css/olMap.css";
import Map from "ol/Map.js";
import OSM from "ol/source/OSM.js";
import TileLayer from "ol/layer/Tile.js";
import View from "ol/View.js";

import store from "./store";

let olMap;

function initOLMap() {
  console.log("initOLMap mapConfig;: ", store.state.mapConfig);
  console.log(store.getters.serviceSettings.value);
  olMap = new Map({
    target: "map",
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
    ],
    view: new View({
      center: [0, 0],
      zoom: 2,
    }),
  });
}

const getOLMap = () => olMap;

export { initOLMap, getOLMap };
