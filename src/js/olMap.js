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
import { wrapText } from "./utils";

import {
  DEFAULT_FILL_COLOR,
  DEFAULT_STROKE_COLOR,
  POINT_CIRCLE_RADIUS,
  POINT_TEXT_VISIBILITY_THRESHOLD,
  POINT_VISIBILITY_THRESHOLD,
  STROKE_WIDTH,
} from "./constants";

const defaultStyle = {
  // Takes effect only for points
  fillColor: DEFAULT_FILL_COLOR,
  circleRadius: POINT_CIRCLE_RADIUS,

  // Affects both points and lines
  strokeColor: DEFAULT_STROKE_COLOR,
  strokeWidth: STROKE_WIDTH,
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

  return new Style({
    ...(feature.getGeometry().getType() === "Point" &&
      // Points should only show when we zoom in
      resolution <= POINT_VISIBILITY_THRESHOLD && {
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
          font: "bold 11pt sans-serif",
          text:
            resolution <= POINT_TEXT_VISIBILITY_THRESHOLD
              ? `${feature.get("stopNumber").toString()}\n${wrapText(
                  feature.get("title"),
                  32
                )}`
              : feature.get("stopNumber").toString(),
          fill: new Fill({ color: strokeColor }),
          stroke: new Stroke({ color: "white", width: 2 }),
        }),
      }),
    ...(feature.getGeometry().getType() === "LineString" && {
      stroke: new Stroke({
        color: strokeColor,
        width: strokeWidth,
      }),
      text: new Text({
        placement: "line",
        overflow: true,
        font: "bold 12pt sans-serif",
        text: feature.get("title").toString(),
        fill: new Fill({ color: strokeColor }),
        stroke: new Stroke({ color: "white", width: 2 }),
      }),
    }),
  });
}

// eslint-disable-next-line
function selectedStyleFunction(feature, actualResolution) {
  // We ignore the actualResolution and favor the smallest one
  // that is used as a threshold in our style definition, i.e.
  // POINT_TEXT_VISIBILITY_THRESHOLD. This way we ensure that
  // all the parameters that we expect on the style will be available
  // at all times - regardless of the current zoom level. Without this
  // we could run into "getImage() is not available" when the app
  // started with a pre-selected feature and the View hasn't yet
  // animated close enough.
  const normalStyle = styleFunction(feature, POINT_TEXT_VISIBILITY_THRESHOLD);
  if (feature.getGeometry().getType() === "Point") {
    // If app is launched with a point pre-selected, there won't be anything
    // to read the radius from, as the style is hidden at the zoom level
    // from start. So we must fallback to a standard value.
    const normalRadius = normalStyle.getImage().getRadius() || 5;
    normalStyle.getImage().setRadius(normalRadius * 3);
    normalStyle.getText().setFont("bold 15pt sans-serif");
  } else if (feature.getGeometry().getType() === "LineString") {
    const normalStrokeWidth = normalStyle.getStroke().getWidth();
    normalStyle.getStroke().setWidth(normalStrokeWidth * 1.5);
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
    declutter: true,
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
    declutter: true,
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
      padding: [0, 0, 0, 0], // Can be adjusted, to make room for Sheet overlays
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
    // TODO: Add error show to user.
    console.warn(error);

    // Dispatch the error only if its code differs from the one in state
    store.state.geolocationError?.code !== error.code &&
      store.dispatch("setGeolocationError", error);
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

  f7.on("adjustForHeight", (overlayHeight) => {
    // The "padding" member of the View instance is an Array where
    // the bottom padding distance is the third element.
    olMap.getView().padding[2] = overlayHeight;
  });

  olMap.addInteraction(selectInteraction);

  updateFeaturesInMap();
}

const addFeatures = (features) => {
  audioguideSource.addFeatures(features);
};

const fitToAvailableFeatures = () => {
  // Fit View to features' extent only if there are
  // no infinite values (which can happen if the Source
  // is empty).
  !audioguideSource.getExtent().includes(Infinity) &&
    olMap.getView().fit(audioguideSource.getExtent(), { duration: 1500 });
};

const updateFeaturesInMap = () => {
  audioguideSource.clear();
  addFeatures(store.getters.filteredFeatures.value);
  olMap.getView().padding[2] = 0;
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
    const currentPosition = geolocation.getPosition();
    if (currentPosition === undefined) {
      return 1;
    }

    // Grab the Feature in our Source that is closest to the current location, but…
    const closestPoint = audioguideSource.getClosestFeatureToCoordinate(
      currentPosition,
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
    zoom: 9,
  });
};

const goToStopNumber = (stopNumber) => {
  // Helper function that does the real job.
  const navigateToStop = (stopNumber) => {
    const stopFeature = activeGuideSource
      .getFeatures()
      .find((f) => f.get("stopNumber") === stopNumber);

    const coords = stopFeature.getGeometry().getCoordinates();
    animateToPoint(coords);

    store.dispatch("setActiveStopNumber", stopNumber);
  };

  const audioElement = document.querySelector("audio");
  if (audioElement && !audioElement.paused) {
    const confirmMessage =
      "Ljud spelas upp. Om du byter steg avbryts uppspelning. Är du säker på att du vill byta steg?";
    if (confirm(confirmMessage)) {
      audioElement.pause();
      audioElement.currentTime = 0;
      navigateToStop(stopNumber);
    } else {
      // Abort and continue listening
    }
  } else {
    navigateToStop(stopNumber);
  }
};

const deactivateGuide = () => {
  // Tell the store to unset some "active" objects
  store.dispatch("deactivateGuide");

  // Hide the active guide layer and clear its source
  activeGuideLayer.setVisible(false);
  activeGuideSource.clear();

  // Show the audioguide layer
  audioguideLayer.setVisible(true);

  // Reset the map's padding
  olMap.getView().padding[2] = 0;

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
