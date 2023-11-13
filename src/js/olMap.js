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

let olMap, vectorSource, vectorLayer;

async function initOLMap(f7) {
  console.log("Init OL Map ", f7);
  const config = f7.store.state.mapConfig.mapConfig;

  // Setup projections
  config.projections.forEach((p) => {
    proj4.defs(p.code, p.definition);
  });

  register(proj4);

  const baseLayers = config.tools.find((t) => t.type === "layerswitcher")
    .options.baselayers;
  const layersConfig = f7.store.state.mapConfig.layersConfig;
  console.log("baseLayers: ", baseLayers);
  console.log("layersConfig: ", layersConfig);

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
      center: config.map.center,
      constrainOnlyCenter: config.map.constrainOnlyCenter,
      constrainResolution:
        config.map.constrainResolutionMobile ?? config.map.constrainResolution,
      extent: config.map.extent.length > 0 ? config.map.extent : undefined,
      maxZoom: config.map.maxZoom || 24,
      minZoom: config.map.minZoom || 0,
      projection: config.map.projection,
      resolutions: config.map.resolutions,
      units: "m",
      zoom: config.map.zoom,
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

  f7.on("olFeatureSelected", (f) => {
    if (f.length === 0) {
      // If something else emitted the event with an empty selection array,
      // let's deselect here too.
      selectInteraction.getFeatures().clear();
    } else {
      // It looks as we'll be adding a feature to the selection, programmatically.
      selectInteraction.getFeatures().clear();

      selectInteraction.getFeatures().push(f[0]);

      // Zoom to feature
      const selectionExtent = f[0].getGeometry().getExtent();
      olMap.getView().fit(selectionExtent);
    }
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
