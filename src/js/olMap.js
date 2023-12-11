import "../css/olMap.css";

import proj4 from "proj4";
import { register } from "ol/proj/proj4";

import { Map, View, Feature, Geolocation } from "ol";
import { ScaleLine } from "ol/control";
import Point from "ol/geom/Point";
// import OSM from "ol/source/OSM";
// import TileLayer from "ol/layer/Tile";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import Select from "ol/interaction/Select";
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from "ol/style";

import store from "./store";

import { createLayersFromConfig } from "./olHelpers";

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

  const audioguideLayersAttribution =
    config.tools.audioguide?.audioguideLayersAttribution;

  // Setup source and layer for the Audioguide features
  audioguideSource = new VectorSource({
    attributions: audioguideLayersAttribution,
  });
  audioguideLayer = new VectorLayer({
    source: audioguideSource,
    layerType: "system",
    zIndex: 5000,
    name: "pluginAudioguideAllGuides",
    caption: "All audioguides",
    style: styleFunction,
  });

  activeGuideSource = new VectorSource({
    attributions: audioguideLayersAttribution,
  });
  activeGuideLayer = new VectorLayer({
    source: activeGuideSource,
    layerType: "system",
    zIndex: 5001,
    name: "pluginAudioguideActiveGuide",
    caption: "Active audioguide",
    visible: false, // Start with hidden
    style: styleFunction,
  });

  // Setup Map and View
  olMap = new Map({
    target: "map",
    controls: [
      new ScaleLine({
        units: "metric",
        bar: true,
        steps: 4,
        text: false,
        minWidth: 140,
        maxWidth: 240,
      }),
    ],

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
    name: "pluginAudioguideGeolocation",
    caption: "Audioguide Geolocation",
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
      olMap.getView().fit(selectionExtent, { duration: 1000 });
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

const fitToAvailableFeatures = () => {
  // Fit View to features' extent only if there are
  // no infinite values (which can happen if the Source
  // is empty).
  !audioguideSource.getExtent().includes(Infinity) &&
    olMap.getView().fit(audioguideSource.getExtent(), { duration: 1500 });
};

const updateFeaturesInMap = () => {
  removeAllFeatures();
  addFeatures(store.getters.filteredFeatures.value);
  fitToAvailableFeatures();
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
    console.error("enableGeolocation: ", error);
  }
};

const getClosestStopNumberFromCurrentPosition = (guideId) => {
  try {
    // Grab the Feature in our Source that is closest to the current location, but…
    const closestPoint = audioguideSource.getClosestFeatureToCoordinate(
      geolocation.getPosition(),
      (f) => {
        return (
          // …let's filter so we only match the current guide's guideId, and…
          f.get("guideId") === guideId &&
          // …only care about the Point features (otherwise, LineStrings would match too)
          f.getGeometry().getType() === "Point"
        );
      }
    );
    // Let's attempt to return Feature's stop number, but fall back to an integer.
    return closestPoint?.get("stopNumber") || 1;
  } catch (error) {
    console.error("getClosestStopNumberFromCurrentPosition: ", error);
  }
};

const convertFeaturesToGuideObject = (features) => {
  const ro = {
    line: null,
    points: {},
  };
  features.forEach((f) => {
    if (f.getGeometry().getType() === "LineString") {
      ro.line = f;
    } else {
      const stopNumber = f.get("stopNumber");
      ro.points[stopNumber] = f;
    }
  });
  return ro;
};

const activateGuide = (guideId, stopNumber) => {
  // Let's grab all points that belong to this line feature
  const features = audioguideLayer
    .getSource()
    .getFeatures()
    .filter((f) => f.get("guideId") === guideId);

  const activateGuideObject = convertFeaturesToGuideObject(features);

  // Let's grab the starting point's coordinates
  const activePointFeature = features.find(
    (f) => f.get("stopNumber") === stopNumber
  );

  // OL must inform the F7 store that it should activate
  // this guide object
  store.dispatch("setActiveGuideObject", activateGuideObject);
  store.dispatch("setActiveStopNumber", stopNumber);

  // Add features to source
  activeGuideSource.addFeatures(features);

  // Ensure that we hide the layer with all guides…
  audioguideLayer.setVisible(false);
  // …and show the one with the active guide.
  activeGuideLayer.setVisible(true);

  // Finally, navigate to starting point
  animateToPoint(activePointFeature.getGeometry().getCoordinates());
};

const animateToPoint = (coords) => {
  olMap.getView().animate({
    center: coords,
    duration: 1000,
    zoom: 10,
  });
};

const goToStopNumber = (stopNumber) => {
  console.log("go to stopNumber: ", stopNumber);
  const coords = activeGuideSource
    .getFeatures()
    .find((f) => f.get("stopNumber") === stopNumber)
    .getGeometry()
    .getCoordinates();
  animateToPoint(coords);

  // Tell the UI
  store.dispatch("setActiveStopNumber", stopNumber);
};

const deactivateGuide = () => {
  // Tell the store to unset some "active" objects
  store.dispatch("deactivateGuide");

  // Rest layers visibility to its initial state.
  activeGuideLayer.setVisible(false);
  activeGuideSource.clear();

  audioguideLayer.setVisible(true);
  fitToAvailableFeatures();
};

const getOLMap = () => olMap;

export {
  initOLMap,
  getOLMap,
  updateFeaturesInMap,
  setBackgroundLayer,
  getLayerVisibility,
  enableGeolocation,
  getClosestStopNumberFromCurrentPosition,
  activateGuide,
  deactivateGuide,
  goToStopNumber,
};
