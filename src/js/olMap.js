import "../css/olMap.css";

import proj4 from "proj4";
import { register } from "ol/proj/proj4";

import Map from "ol/Map";
import View from "ol/View";
import Point from "ol/geom/Point";
// import OSM from "ol/source/OSM";
// import TileLayer from "ol/layer/Tile";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import Select from "ol/interaction/Select";
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from "ol/style";

import store from "./store";

import { createLayersFromConfig } from "./olHelpers";
import { Feature, Geolocation } from "ol";

const defaultStyle = {
  // Takes effect only for points
  fillColor: "orange",
  circleRadius: 5,

  // Affects both points and lines
  strokeColor: "orange",
  strokeWidth: 2,
};

let olMap,
  audioguideSource,
  audioguideLayer,
  geolocation,
  activeGuideSource,
  activeGuideLayer;

function styleFunction(feature, resolution) {
  // Attempt to parse the JSON style from DB
  let parsedStyle = {};
  try {
    parsedStyle = JSON.parse(feature.get("style")) || {};
  } catch (error) {
    parsedStyle = {};
  }

  // Let's merge the default styles with those (presumably) parsed.
  const { strokeColor, strokeWidth, fillColor, circleRadius } = {
    ...defaultStyle,
    ...parsedStyle,
  };

  // TODO: Document these changed in README, 'style' is a new JSONB column.

  return new Style({
    ...(feature.getGeometry().getType() === "Point" &&
      // Points should only show when we zoom in
      resolution < 3 && {
        image: new CircleStyle({
          fill: new Fill({
            color: fillColor,
          }),
          stroke: new Stroke({
            color: strokeColor,
            width: strokeWidth,
          }),
          radius: circleRadius,
        }),
        text: new Text({
          textAlign: "center",
          textBaseline: "middle",
          font: "normal 13pt sans-serif",
          text:
            resolution < 1
              ? `${feature.get("stopNumber").toString()}\n${feature.get(
                  "title"
                )}`
              : feature.get("stopNumber").toString(),
          fill: new Fill({ color: "black" }),
          stroke: new Stroke({ color: "white", width: 2 }),
        }),
      }),
    ...(feature.getGeometry().getType() === "LineString" && {
      stroke: new Stroke({
        color: strokeColor,
        width: strokeWidth,
      }),
    }),
  });
}

function selectedStyleFunction(feature, resolution) {
  const normalStyle = styleFunction(feature, resolution);
  if (feature.getGeometry().getType() === "Point") {
    const normalRadius = normalStyle.getImage().getRadius();
    normalStyle.getImage().setRadius(normalRadius * 3);
    normalStyle.getText().setFont("bold 15pt sans-serif");
  } else if (feature.getGeometry().getType() === "LineString") {
    const normalStrokeWidth = normalStyle.getStroke().getWidth();
    normalStyle.getStroke().setWidth(normalStrokeWidth * 3);
  }
  return normalStyle;
}

async function initOLMap(f7) {
  console.log("Init OL Map ", f7);
  const config = f7.store.state.mapConfig;

  // Setup projections
  config.projections.forEach((p) => {
    proj4.defs(p.code, p.definition);
  });

  register(proj4);

  const backgroundLayers = createLayersFromConfig(
    config.backgrounds,
    config.map,
    "background"
  );
  // console.log("backgroundLayers: ", backgroundLayers);

  // Setup source and layer for the AudioGuide features
  audioguideSource = new VectorSource();
  audioguideLayer = new VectorLayer({
    source: audioguideSource,
    layerType: "system",
    zIndex: 5000,
    name: "pluginAudioGuideAllGuides",
    caption: "All audioguides",
    style: styleFunction,
  });

  activeGuideSource = new VectorSource();
  activeGuideLayer = new VectorLayer({
    source: activeGuideSource,
    layerType: "system",
    zIndex: 5001,
    name: "pluginAudioGuideActiveGuide",
    caption: "Active audioguide",
    visible: false, // Start with hidden
    style: styleFunction,
  });

  // Setup Map and View
  olMap = new Map({
    target: "map",
    layers: [
      // new TileLayer({
      //   source: new OSM(),
      // }),
      audioguideLayer,
      activeGuideLayer,
      ...backgroundLayers,
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

  // Setup geolocation
  geolocation = new Geolocation({
    trackingOptions: {
      enableHighAccuracy: true,
    },
    projection: olMap.getView().getProjection(),
  });

  // Handle geolocation error
  geolocation.on("error", function (error) {
    console.warn(error);
  });

  // Create an accuracy feature…
  const geolocationAccuracyFeature = new Feature();
  // …and ensure its geometry gets updated when geolocation
  // accuracy changes.
  geolocation.on("change:accuracyGeometry", () => {
    geolocationAccuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
  });

  // Create a position feature…
  const geolocationPositionFeature = new Feature();
  geolocationPositionFeature.setStyle(
    new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({
          color: "#3399CC",
        }),
        stroke: new Stroke({
          color: "#fff",
          width: 2,
        }),
      }),
    })
  );

  //  …and make sure we update its geometry when geolocation
  // says that the position has changed.
  geolocation.on("change:position", function () {
    const coordinates = geolocation.getPosition();
    geolocationPositionFeature.setGeometry(
      coordinates ? new Point(coordinates) : null
    );
  });

  // The Geolocation features will need a source and a layer
  // to be added to.
  const geolocationSource = new VectorSource({
    features: [geolocationAccuracyFeature, geolocationPositionFeature],
  });
  const geolocationLayer = new VectorLayer({
    source: geolocationSource,
    layerType: "system",
    name: "pluginAudioGuideGeolocation",
    caption: "AudioGuide Geolocation",
  });

  // Finally, add the geolocation layer
  olMap.addLayer(geolocationLayer);

  // Setup the select interaction…
  const selectInteraction = new Select({
    hitTolerance: 20,
    layers: [audioguideLayer], // We want to only get hits from the audioguide layer
    style: selectedStyleFunction,
  });

  // …and interaction handler.
  selectInteraction.on("select", async (e) => {
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

  f7.on("olCenterOnGeolocation", () => {
    // View.animate() actually wants two coordinates (to center on),
    // while getExtent() returns an array of four coordinates. In case
    // of Point features, we might as well use getCoordinates() (or
    // even getFirstCoordinates()) and we'd still end up with the same
    // first two elements. So we go for getExtent() for that reason.
    if (geolocationPositionFeature.getGeometry() === undefined) {
      console.warn("Could not get geolocation");
    } else {
      olMap.getView().animate({
        center: geolocationPositionFeature.getGeometry().getExtent(),
        zoom: 10,
        duration: 3000,
      });
    }
  });

  olMap.addInteraction(selectInteraction);

  updateFeaturesInMap();
}

const addFeatures = (features) => {
  audioguideSource.addFeatures(features);
};

const removeAllFeatures = () => {
  audioguideSource.clear();
};

const updateFeaturesInMap = () => {
  removeAllFeatures();
  addFeatures(store.getters.filteredFeatures.value);

  // Fit View to features' extent only if there are
  // no infinite values (which can happen if the Source
  // is empty).
  !audioguideSource.getExtent().includes(Infinity) &&
    olMap.getView().fit(audioguideSource.getExtent());
};

const setBackgroundLayer = (lid) => {
  // Go through layers and…
  olMap.getAllLayers().forEach((l) => {
    // …turn off any background layers.
    if (l.get("layerType") === "background") {
      l.setVisible(false);
    }
    // Set this as visible
    if (l.get("lid") === lid) {
      l.setVisible(true);
    }
  });
};

const getLayerVisibility = (lid) => {
  return olMap
    ?.getAllLayers()
    .find((l) => l.get("lid") === lid)
    ?.getVisible();
};

const enableGeolocation = () => {
  try {
    geolocation.setTracking(true);
  } catch (error) {
    console.error("error: ", error);
  }
};

const activateGuide = (features) => {
  console.log("activateGuide features: ", features);
  // First, ensure that we hide the layer with all guides
  audioguideLayer.setVisible(false);

  activeGuideSource.addFeatures(features);

  activeGuideLayer.setVisible(true);
};

const getOLMap = () => olMap;

export {
  initOLMap,
  getOLMap,
  updateFeaturesInMap,
  setBackgroundLayer,
  getLayerVisibility,
  enableGeolocation,
  activateGuide,
};
