import "../css/olMap.css";

import proj4 from "proj4";
import { register } from "ol/proj/proj4";

import Map from "ol/Map";
import View from "ol/View";
import OSM from "ol/source/OSM";
import TileLayer from "ol/layer/Tile";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import Select from "ol/interaction/Select";
import { Circle, Fill, Stroke, Style } from "ol/style";

import store from "./store";

const fill = new Fill({
  color: "rgba(255,255,255,0.4)",
});
const stroke = new Stroke({
  color: "red",
  width: 3,
});
const selectedStyle = [
  new Style({
    image: new Circle({
      fill: fill,
      stroke: stroke,
      radius: 5,
    }),
    fill: fill,
    stroke: stroke,
  }),
];

const projectionDefinitions = [
  {
    code: "EPSG:3006",
    name: "Sweref 99 TM",
    definition:
      "+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
    extent: [218128.7031, 6126002.9379, 1083427.297, 7692850.9468],
    units: null,
  },
  {
    code: "EPSG:3007",
    name: "Sweref 99 12 00",
    definition:
      "+proj=tmerc +lat_0=0 +lon_0=12 +k=1 +x_0=150000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
    extent: [60436.5084, 6192389.565, 217643.4713, 6682784.4276],
    units: null,
  },
  {
    code: "EPSG:3008",
    name: "Sweref 99 13 30",
    definition:
      "+proj=tmerc +lat_0=0 +lon_0=13.5 +k=1 +x_0=150000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
    extent: [60857.4994, 6120098.8505, 223225.0217, 6906693.7888],
    units: null,
  },
];

let olMap, vectorSource, vectorLayer;

async function initOLMap(f7) {
  console.log("Init OL Map ", f7);
  // Setup projections
  projectionDefinitions.forEach((p) => {
    proj4.defs(p.code, p.definition);
  });

  register(proj4);

  // Setup sources and layers
  vectorSource = new VectorSource();
  vectorLayer = new VectorLayer({
    source: vectorSource,
    layerType: "system",
    zIndex: 5000,
    name: "pluginAudioGuide",
    caption: "AudioGuide layer",
    // style: new Style({
    //   stroke: new Stroke({
    //     color: "rgba(0, 0, 255, 1.0)",
    //     width: 2,
    //   }),
    // }),
  });

  // Setup Map and View
  olMap = new Map({
    target: "map",
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
      vectorLayer,
    ],
    view: new View({
      center: [0, 0],
      zoom: 2,
      projection: "EPSG:3008",
    }),
  });

  // Setup the interaction…
  const selectInteraction = new Select({
    hitTolerance: 20,
    style: selectedStyle,
  });

  // …and interaction handler.
  selectInteraction.on("select", (e) => {
    f7.emit("olFeatureSelected", e.selected);
  });

  olMap.addInteraction(selectInteraction);

  updateFeaturesInMap();
}

const addFeatures = (features) => {
  vectorSource.addFeatures(features);
};

const removeAllFeatures = () => {
  vectorSource.clear();
};

const updateFeaturesInMap = () => {
  removeAllFeatures();
  addFeatures(store.getters.selectedFeatures.value);

  // Fit View to features' extent only if there are
  // no infinite values (which can happen if the Source
  // is empty).
  !vectorSource.getExtent().includes(Infinity) &&
    olMap.getView().fit(vectorSource.getExtent());
};

const getOLMap = () => olMap;

export { initOLMap, getOLMap, updateFeaturesInMap };
