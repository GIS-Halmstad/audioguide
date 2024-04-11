import Framework7 from "framework7/types";
import { StyleFunction } from "openlayers";

import "../../css/olMap.css";

import proj4 from "proj4";
import { register } from "ol/proj/proj4";

import { Map, View, Feature } from "ol";
import Geolocation, { GeolocationError } from "ol/Geolocation";
import { ScaleLine, Zoom } from "ol/control";
import { Extent, containsCoordinate } from "ol/extent";
import { Geometry, Point, Polygon } from "ol/geom";
// import OSM from "ol/source/OSM";
// import TileLayer from "ol/layer/Tile";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import Select from "ol/interaction/Select";
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from "ol/style";

import store from "../store";

import { createLayersFromConfig } from "./olHelpers";
import { parseStyle } from "../f7Helpers";
import { wrapText } from "../utils";

import {
  LAYER_NAME_ACTIVE_GUIDE,
  LAYER_NAME_ALL_GUIDES,
  LAYER_NAME_GEOLOCATION,
  POINT_TEXT_VISIBILITY_THRESHOLD,
  POINT_VISIBILITY_THRESHOLD,
} from "../constants";

import BackgroundSwitcherControl from "./BackgroundSwitcherControl";
import GeolocateControl from "./GeolocateControl";
import RotateWithNorthLockControl from "./RotateWithNorthLockControl";
import Layer from "ol/layer/Layer";

let olMap!: Map,
  constrainedExtent: Extent | undefined,
  audioguideSource: VectorSource,
  audioguideLayer: VectorLayer<VectorSource>,
  compassWebkitListener: (e: DeviceOrientationEvent) => void,
  compassAbsoluteListener: (e: DeviceOrientationEvent) => void,
  geolocation: Geolocation,
  geolocationPositionFeature: Feature<Point>,
  geolocationAccuracyFeature: Feature<Polygon>,
  activeGuideSource: VectorSource,
  activeGuideLayer: VectorLayer<VectorSource>;

function normalStyleFunction(feature: Feature, resolution: number) {
  // We need to know if we're dealing with a Point or a LineString
  const featureType = feature.getGeometry()?.getType();
  const stopNumber = feature.get("stopNumber");

  // Let's extract any custom styles that may exist on the given feature.
  const { strokeColor, strokeWidth, fillColor, circleRadius } =
    parseStyle(feature);

  return new Style({
    ...(featureType === "Point" &&
      // Points should only show when we zoom in, unless it's the first stop.
      // These are always visible.
      (resolution <= POINT_VISIBILITY_THRESHOLD || stopNumber === 1) && {
        image: new CircleStyle({
          fill: new Fill({
            color: fillColor,
          }),
          stroke: new Stroke({
            color: strokeColor,
            width: strokeWidth,
          }),
          radius: stopNumber === 1 ? circleRadius * 2 : circleRadius,
        }),
        text: new Text({
          textAlign: "center",
          textBaseline: "middle",
          font: `bold ${stopNumber === 1 ? "18" : "11"}pt sans-serif`,
          text:
            // Show a long label when user zooms in close enough
            resolution <= POINT_TEXT_VISIBILITY_THRESHOLD
              ? `${stopNumber.toString()}\n${wrapText(
                  feature.get("title"),
                  32
                )}`
              : // Show only the stop's number if user zooms in close enough.
              // If user zooms out, show "Start" instead of the number.
              resolution >= POINT_VISIBILITY_THRESHOLD && stopNumber === 1
              ? "Start"
              : stopNumber.toString(),
          fill: new Fill({ color: strokeColor }),
          stroke: new Stroke({ color: "white", width: 2 }),
        }),
      }),
    ...(featureType === "LineString" && {
      stroke: new Stroke({
        color: strokeColor,
        width: strokeWidth,
      }),
      text: new Text({
        placement:
          POINT_TEXT_VISIBILITY_THRESHOLD < resolution ? "point" : "line",
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
function selectedStyleFunction(feature: Feature<Geometry>): Style {
  // We ignore the actualResolution and favor the smallest one
  // that is used as a threshold in our style definition, i.e.
  // POINT_TEXT_VISIBILITY_THRESHOLD. This way we ensure that
  // all the parameters that we expect on the style will be available
  // at all times - regardless of the current zoom level. Without this
  // we could run into "getImage() is not available" when the app
  // started with a pre-selected feature and the View hasn't yet
  // animated close enough.
  const normalStyle = normalStyleFunction(
    feature,
    POINT_TEXT_VISIBILITY_THRESHOLD
  );

  // We want to make some changes to the "normal" style of our Points and Lines.
  // First, let's find out what type of geometry we're dealing with.
  if (feature.getGeometry()?.getType() === "Point") {
    // We want to increase the radius of selected points. First, let's grab
    // current radius. Note that if the app is launched with a
    // point pre-selected, there won't be anything
    // to read the radius from, as the style is hidden at the zoom level
    // from start. So we must fallback to a standard value.
    const normalRadius = normalStyle.getImage().getRadius() || 5;

    // Increase the Point's size…
    normalStyle.getImage().setRadius(normalRadius * 3);
    // …and make the text a bit larger.
    normalStyle.getText().setFont("bold 15pt sans-serif");
  } else if (feature.getGeometry()?.getType() === "LineString") {
    // We want to increase the stroke width of selected lines.
    const normalStrokeWidth = normalStyle.getStroke().getWidth();
    normalStyle.getStroke().setWidth(normalStrokeWidth * 1.5);
    // Also, let's remove the label: once a guide is selected, the
    // label will be visible in the UI anyway, so there's no need
    // to clutter the map with this text.
    normalStyle.setText(new Text({}));
  }
  return normalStyle;
}

function selectedActiveStyleFunction(
  feature: Feature,
  resolution: number
): Style {
  // We need to know if we're dealing with a Point or a LineString
  const featureType = feature.getGeometry()?.getType();
  const stopNumber = feature.get("stopNumber");

  // Let's extract any custom styles that may exist on the given feature.
  const { strokeColor, strokeWidth, fillColor, circleRadius } =
    parseStyle(feature);

  return new Style({
    ...(featureType === "Point" && { // Active Points should always be visible.
      image: new CircleStyle({
        fill: new Fill({
          color: fillColor,
        }),
        stroke: new Stroke({
          color: strokeColor,
          width: strokeWidth,
        }),
        radius: circleRadius * 2,
      }),
      text: new Text({
        textAlign: "center",
        textBaseline: "middle",
        font: `bold 18pt sans-serif`,
        text:
          // Show a long label when user zooms in close enough
          resolution <= POINT_TEXT_VISIBILITY_THRESHOLD
            ? `${stopNumber.toString()}\n${wrapText(feature.get("title"), 32)}`
            : // Show only the stop's number if user zooms in close enough.
            // If user zooms out, show "Start" instead of the number.
            resolution >= POINT_VISIBILITY_THRESHOLD && stopNumber === 1
            ? "Start"
            : stopNumber.toString(),
        fill: new Fill({ color: strokeColor }),
        stroke: new Stroke({ color: "white", width: 2 }),
      }),
    }),
    ...(featureType === "LineString" && {
      stroke: new Stroke({
        color: strokeColor,
        width: strokeWidth,
      }),
      text: new Text({
        placement:
          POINT_TEXT_VISIBILITY_THRESHOLD < resolution ? "point" : "line",
        overflow: true,
        font: "bold 12pt sans-serif",
        text: feature.get("title").toString(),
        fill: new Fill({ color: strokeColor }),
        stroke: new Stroke({ color: "white", width: 2 }),
      }),
    }),
  });
}

function activeStyleFunction(feature: Feature<Geometry>): Style {
  const normalStyle = normalStyleFunction(feature, POINT_VISIBILITY_THRESHOLD);
  if (feature.getGeometry()?.getType() === "Point") {
  } else if (feature.getGeometry()?.getType() === "LineString") {
    // When a guide is active, there's no need to show the line's label.
    // It's visible in the UI anyway.
    normalStyle.setText(new Text({}));
  }
  return normalStyle;
}

let f7Instance: Framework7;

async function initOLMap(f7: Framework7) {
  f7Instance = f7;

  console.warn("Init OL Map should only run once ", f7);
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
    name: LAYER_NAME_ALL_GUIDES,
    caption: "All audioguides",
    declutter: true,
    style: normalStyleFunction,
  });

  activeGuideSource = new VectorSource({
    attributions: audioguideLayersAttribution,
  });
  activeGuideLayer = new VectorLayer({
    source: activeGuideSource,
    layerType: "system",
    zIndex: 5001,
    name: LAYER_NAME_ACTIVE_GUIDE,
    caption: "Active audioguide",
    visible: false, // Start with hidden
    declutter: true,
    style: activeStyleFunction,
  });

  constrainedExtent =
    config.map.extent.length > 0 ? config.map.extent : undefined;

  // Setup Map and View
  olMap = new Map({
    target: "map",
    controls: [
      new Zoom(),
      new GeolocateControl({ f7Instance }),
      new ScaleLine({
        units: "metric",
        bar: true,
        steps: 4,
        text: false,
        minWidth: 140,
        maxWidth: 240,
      }),
      new BackgroundSwitcherControl({ f7Instance }),
      new RotateWithNorthLockControl({
        autoHide: false,
        label: "",
        f7Instance,
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
      extent: constrainedExtent,
      maxZoom: config.map.maxZoom || 24,
      minZoom: config.map.minZoom || 0,
      projection: config.map.projection,
      resolutions: config.map.resolutions,
      padding: [0, 0, 0, 0], // Can be adjusted, to make room for Sheet overlays
      zoom: config.map.zoom,
    }),
  });

  // Setup listener for view's resolution change
  // olMap.getView().on("change:resolution", (e) => {
  //   console.log(`${e.oldValue} -> ${e.target.getResolution()}`);
  // });

  // Setup geolocation
  geolocation = new Geolocation({
    trackingOptions: {
      enableHighAccuracy: true,
    },
    projection: olMap.getView().getProjection(),
  });

  // Create an accuracy feature. We don't need any special
  // styling, the default OL polygon style is fine.
  geolocationAccuracyFeature = new Feature();

  // Create a position feature…
  geolocationPositionFeature = new Feature();
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

  // Update position feature's geometry when geolocation changes. Also, do
  // some other updates if this is the first time geolocation is enabled.
  geolocation.on("change:position", (e) => {
    const coordinates = geolocation.getPosition();
    if (e.target.getTracking() === true && coordinates !== undefined) {
      // If there's a extent constrained specified int the map config, let's ensure
      // the user's current location is within that extent. Otherwise, let's assume
      // the user is within the map's extent.
      const userWithinMap =
        constrainedExtent !== undefined
          ? containsCoordinate(constrainedExtent, coordinates)
          : true;

      if (userWithinMap === true) {
        // Set position feature's geometry to the new coordinates.
        geolocationPositionFeature.setGeometry(new Point(coordinates));

        // If the current geolocationStatus is anything else than "granted", updated it.
        // Usually this means that we can hide the preloader and center on location too.
        if (store.state.geolocationStatus !== "granted") {
          store.dispatch("setGeolocationStatus", "granted");
          f7Instance.preloader.hide();
          centerOnGeolocation();
        }
      } else {
        // If the user is not within our Map's extent, we must hide
        // the preloader, show an informative alert and disable geolocation and compass.
        f7Instance.preloader.hide();
        f7Instance.dialog.alert(
          "För att kunna visa din position i kartan behöver du vara inom dess utbredningsområde. Du kan fortfarande använda appen, men du kommer inte kunna se din position i kartan.",
          "Du är utanför kartan"
        );
        disableCompass();
        disableGeolocation();
      }
    }
  });

  /**
   * @summary Update geolocation status to pending when user
   * clicks on the enable geolocation button.
   * @description This handler's main function is to update the geolocation status
   * and show a pending indicator to the user, to reflect the ongoing geolocation process.
   * There are two possible flows here:
   * 1. Tracking is enabled. In this case what happens next depends is determined by the
   *    outcome of the attempted geolocation process:
   *    - If successful, the geolocation's "position" property changes, meaning that
   *      the program's flow continues in the "change:position" handler.
   *    - If unsuccessful, the program's flow continues in the "error" handler.
   * 2. Tracking is disabled. In this case we must unset the UI here, as no "change:position"
   *    will be triggered.
   */
  geolocation.on("change:tracking", (e) => {
    if (e.target.getTracking() === true) {
      // If tracking changes to true, we can tell that we're in the pending mode
      // awaiting user's permission as well as the actual response from the hardware.
      store.dispatch("setGeolocationStatus", "pending");
      // Show pending indicator and enable tracking.
      f7Instance.preloader.show();
    } else {
      store.dispatch("setGeolocationStatus", "disabled");
      // Cleanup the map by unsetting features' geometries.
      geolocationAccuracyFeature.setGeometry(undefined);
      geolocationPositionFeature.setGeometry(undefined);
    }
  });

  // Update the accuracy feature's geometry when the accuracy changes.
  geolocation.on("change:accuracyGeometry", () => {
    geolocationAccuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
  });

  // Handle geolocation error
  geolocation.on("error", handleGeolocationError);

  // The Geolocation features will need a source and a layer
  // to be added to.
  const geolocationSource = new VectorSource({
    features: [geolocationAccuracyFeature, geolocationPositionFeature],
  });
  const geolocationLayer = new VectorLayer({
    source: geolocationSource,
    layerType: "system",
    name: LAYER_NAME_GEOLOCATION,
    caption: "Audioguide Geolocation",
  });

  // Finally, add the geolocation layer
  olMap.addLayer(geolocationLayer);

  const hitTolerance = config.map.hitTolerance || 0;

  // Setup the select interaction…
  const selectInteraction = new Select({
    hitTolerance,
    style: selectedStyleFunction,
    filter: (feature, layer) => {
      // Select interaction should meet a couple of conditions before a
      // click is permitted:
      if (
        // If the layer clicked is anything else than our two allowed layers, ignore selection.
        [LAYER_NAME_ACTIVE_GUIDE, LAYER_NAME_ALL_GUIDES].includes(
          layer.get("name")
        ) === false
      ) {
        return false;
      } else if (
        // Next, ignore selection if there's an active guide AND user clicked
        // on anything but a point.
        store.state.activeGuideObject !== null &&
        feature.getGeometry()?.getType() !== "Point"
      ) {
        return false;
      } else {
        return true;
      }
    },
  });

  // …and interaction handler.
  selectInteraction.on("select", async (e) => {
    if (store.state.activeGuideObject === null) {
      // If there's no active guide yet, let's allow for feature selection.
      f7.emit("olFeatureSelected", e.selected);
      // check if e.selected is an array but is not empty
      if (e.selected?.length > 0) {
        const guideId = e.selected[0].get("guideId");
        const stopNumber = e.selected[0].get("stopNumber");
        store.dispatch("trackAnalyticsEvent", {
          eventName: "guideClickedInMap",
          guideId,
          ...(stopNumber && { stopNumber }),
        });
      }
    } else {
      // Else, if there already is an active guide and the click got through,
      // it means that user clicked on a stop. Let's navigate to it.
      if (e.selected?.length > 0) {
        // Just some more safety checks.
        const stopNumber = e.selected[0].get("stopNumber");
        goToStopNumber(stopNumber);
      }
    }
  });

  /**
   * Event handler for 'olFeatureSelected' event emitted on the global event bus.
   * It makes it possible to utilize OL's select interaction to programmatically
   * select or deselect a feature.
   *
   * @param {Array} f - An array with the feature to be selected. Empty to deselect.
   * @param {number} [delay=0] - Optional delay added before running the zoom animation.
   */
  f7.on("olFeatureSelected", (f: Feature[], delay = 0) => {
    // If the selection array is empty, let's deselect everything.
    if (f.length === 0) {
      // Show all in this layer (that were previously hidden), by setting style to default
      audioguideSource.getFeatures().forEach((feature) => {
        // Neat way to reset a feature's style is to unset any previous
        // override. This will fall back to the layer's default style,
        // hence showing the feature again.
        feature.setStyle(undefined);
      });

      // The actual deselection is handled by clearing the
      // feature collection of the select interaction.
      selectInteraction.getFeatures().clear();
    }
    // Else, if the selection array is not empty, there's a feature
    // that should be added to the selection interaction programmatically.
    else {
      // First, hide all features, except those that belong to the currently
      // selected guide (we determine it by looking at the guideId).
      audioguideSource.getFeatures().forEach((feature) => {
        if (feature.get("guideId") !== f[0].get("guideId")) {
          // A neat way to hide a feature is to set its style to a new
          // Style, which contains no styling at all (empty object).
          feature.setStyle(new Style({}));
        }
      });
      // Next, clear any possible previously selected features…
      selectInteraction.getFeatures().clear();
      // …and add the newly selected feature to the select interaction's feature collection.
      selectInteraction.getFeatures().push(f[0]);

      // Finally, zoom to selection, perhaps using a delay.
      const selectionExtent = f[0].getGeometry().getExtent();
      if (delay === 0) {
        olMap.getView().fit(selectionExtent, { duration: 1000 });
      } else {
        setTimeout(() => {
          olMap.getView().fit(selectionExtent, { duration: 1000 });
        }, delay);
      }
    }
  });

  f7.on("olCenterOnGeolocation", centerOnGeolocation);

  f7.on("adjustForHeight", (overlayHeight) => {
    // The "padding" member of the View instance is an Array where
    // the bottom padding distance is the third element.
    olMap.getView().padding[2] = overlayHeight;
  });

  olMap.addInteraction(selectInteraction);

  updateFeaturesInMap();
  console.log("OL Map Init Done");
  console.log("Map:", olMap);
  console.log("Audioguide Layer", audioguideLayer);
  console.log("Active Guide Layer", activeGuideLayer);
}

const handleGeolocationError = (error: GeolocationError) => {
  console.error("Geolocation error:", error);

  // First things first: hide the preloader to unblock the UI.
  f7Instance.preloader.hide();

  // Next, disable tracking. This will also set geolocation status to "disabled",
  // but we'll correct it soon (as an error should have status "denied").
  geolocation.setTracking(false);

  // Cleanup the map by unsetting features' geometries.
  geolocationAccuracyFeature.setGeometry(undefined);
  geolocationPositionFeature.setGeometry(undefined);

  let errorMessage: string;
  switch (error.code) {
    case 1:
      errorMessage =
        "För att fastställa position behöver appen din tillåtelse. Ändra i enhetens inställningar och ladda om appen.";
      break;

    case 2:
      errorMessage =
        "Det gick inte att hämta platsinformationen eftersom en eller flera interna källor stötte på ett fel.";
      break;

    default:
      errorMessage = error.message;
      break;
  }

  f7Instance.dialog.alert(
    errorMessage,
    error.code !== 1 ? "Positioneringsfel" : ""
  );

  // Finally, ensure the correct geolocation status.
  store.dispatch("setGeolocationStatus", "denied");
};

const centerOnGeolocation = () => {
  // View.animate() actually wants two coordinates (to center on),
  // while getExtent() returns an array of four coordinates. In case
  // of Point features, we might as well use getCoordinates() (or
  // even getFirstCoordinates()) and we'd still end up with the same
  // first two elements. So we go for getExtent() for that reason.
  if (geolocationPositionFeature.getGeometry() === undefined) {
    console.warn("Could not get geolocation");
  } else {
    olMap.getView().animate({
      center: geolocation.getPosition(),
      zoom: 8,
      duration: 3000,
    });
  }
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
  audioguideSource.addFeatures(store.getters.filteredFeatures.value);
  olMap.getView().padding[2] = 0;
  fitToAvailableFeatures();
};

const setBackgroundLayer = (lid: Layer) => {
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

const getLayerVisibility = (lid: string | undefined) => {
  return olMap
    ?.getAllLayers()
    .find((l) => l.get("lid") === lid)
    ?.getVisible();
};

const enableCompass = () => {
  if (!window["DeviceOrientationEvent"]) {
    console.warn("DeviceOrientation API not available");
    return;
  }
  let lastHeading: number;

  const callback = (heading: number = 0) => {
    // Don't rotate if map is animating (e.g. due to an ongoing zoom), as that would
    // stop the animation. Also, don't rotate if north is locked.
    if (
      olMap.getView().getAnimating() === true ||
      store.state.northLock === true
    ) {
      return;
    }

    // Convert heading from degrees to radians, negation because otherwise we'll end up
    // rotating the background in the wrong direction.
    const inRad = -(heading / 180) * Math.PI;

    olMap.getView().setRotation(inRad);
  };

  // compassAbsoluteListener and compassWebkitListener are in the global scope
  // so that we can set them in this function but also use in disableCompass(),
  // in order to unsubscribe from the listeners when compass is disabled.
  compassAbsoluteListener = (e: DeviceOrientationEvent) => {
    if (!e.absolute || e.alpha === null || e.beta === null || e.gamma === null)
      return;

    // Determine heading
    let heading = -(e.alpha + (e.beta * e.gamma) / 90);
    heading -= Math.floor(heading / 360) * 360; // Wrap into range [0,360].

    // If heading changed, announce to the callback
    if (heading !== lastHeading) {
      lastHeading = heading;
      callback(heading);
    }
  };

  compassWebkitListener = (e) => {
    // Determine heading, the easy way
    let heading = e.webkitCompassHeading;

    // If heading changed, announce to the callback
    if (heading !== null && !isNaN(heading) && heading !== lastHeading) {
      lastHeading = heading;
      callback(heading);
    }
  };

  const addListeners = () => {
    if ("ondeviceorientationabsolute" in window) {
      window.addEventListener(
        "deviceorientationabsolute",
        compassAbsoluteListener
      );
    } else {
      window.addEventListener("deviceorientation", compassWebkitListener);
    }
  };

  // Devices that support the Permission API must be asked for permission.
  if (typeof DeviceOrientationEvent["requestPermission"] === "function") {
    DeviceOrientationEvent["requestPermission"]().then((response) => {
      if (response === "granted") {
        addListeners();
      } else console.warn("Permission for DeviceMotionEvent not granted");
    });
  }
  // For other devices, let's just add the listeners
  else {
    addListeners();
  }
};

const disableCompass = () => {
  window.removeEventListener(
    "deviceorientationabsolute",
    compassAbsoluteListener
  );
  window.removeEventListener("deviceorientation", compassWebkitListener);
};

/**
 * @summary Main handler that enables geolocation.
 * @description When user clicks the geolocate button, this function is called.
 * The main outcome of this is that the tracking property of the geolocation
 * object changes. Therefore, to further follow the program's flow, refer to the
 * geolocation.on("change:tracking") handler.
 */
const enableGeolocation = () => {
  try {
    if (
      geolocation.getTracking() === true &&
      store.state.geolocationStatus === "denied"
    ) {
      // If user has previously denied, let's disable tracking before
      // re-enabling it.
      geolocation.setTracking(false);
    }

    geolocation.setTracking(true);
  } catch (error) {
    // Normally, we wouldn't get here, as setTracking()
    // throws an error that is caught by the geolocation.on("error")
    // handler. But, who knows what weird cases may occur out in the wild.
    handleGeolocationError(error);
  }
};

const disableGeolocation = () => {
  try {
    // Disable tracking
    geolocation.setTracking(false);

    // Reset rotation
    olMap.getView().setRotation(0);

    // Zoom to fit all features
    fitToAvailableFeatures();
  } catch (error) {
    // Normally, we wouldn't get here, as setTracking()
    // throws an error that is caught by the geolocation.on("error")
    // handler. But, who knows what weird cases may occur out in the wild.
    handleGeolocationError(error);
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

const navigateToStopNumber = (stopNumber: number) => {
  // We want to do three things here:
  // - Remove the selection style from all features, except for the current one
  // - Set selection style to the current feature
  // - Grab current feature's coordinates and navigate to it

  // Will hold the selected stop number's coordinates.
  let coords = [0, 0];

  // Loop through all features in the active guide.
  activeGuideSource.getFeatures().forEach((f) => {
    // The selected feature gets special treatment
    if (f.get("stopNumber") === stopNumber) {
      // Set style to selected…
      f.setStyle(selectedActiveStyleFunction);
      // …and grab coordinates.
      coords = f.getGeometry().getCoordinates();
    }
    // All other features go back active layer's default style.
    else {
      f.setStyle(undefined);
    }
  });

  // Animate to the selected feature.
  olMap.getView().animate({
    center: coords,
    duration: 1000,
    zoom: 9,
  });

  // Finally, tell the Store which stop number we are on.
  store.dispatch("setActiveStopNumber", stopNumber);
};

const activateGuide = (guideId: number, stopNumber: number) => {
  // Let's grab all points that belong to this line feature
  const features = audioguideLayer
    .getSource()
    .getFeatures()
    .filter((f) => f.get("guideId") === guideId);

  const activateGuideObject = convertFeaturesToGuideObject(features);

  // OL must inform the F7 store that it should activate
  // this guide object
  store.dispatch("setActiveGuideObject", activateGuideObject);

  // Add features to source
  activeGuideSource.addFeatures(features);

  // Ensure that we hide the layer with all guides…
  audioguideLayer.setVisible(false);
  // …and show the one with the active guide.
  activeGuideLayer.setVisible(true);

  // Finally, navigate to starting point
  navigateToStopNumber(stopNumber);
};

const goToStopNumber = (stopNumber: number) => {
  const audioElement = document.querySelector("audio");
  if (audioElement && !audioElement.paused) {
    const confirmMessage =
      "Ljud spelas upp. Om du byter steg avbryts uppspelning. Är du säker på att du vill byta steg?";
    f7Instance.dialog.confirm(confirmMessage, "Avbryta uppspelning?", () => {
      // On OK, navigate to another stop
      audioElement.pause();
      audioElement.currentTime = 0;
      navigateToStopNumber(stopNumber);
    });
  } else {
    navigateToStopNumber(stopNumber);
  }
};

const deactivateGuide = () => {
  // Reset style for the active stop number. It seems like we're doing it
  // on the active guide layer only, but in fact these are the same OL Features
  // as those in the main audioguide layer. So we reset it here and once we
  // hide the active layer and show the main layer, this style will apply.
  const activeStopFeature = activeGuideSource
    .getFeatures()
    .find((f) => f.get("stopNumber") === store.state.activeStopNumber);
  activeStopFeature.setStyle(normalStyleFunction);

  // Tell the store to unset activeStopNumber and activeGuideObject
  store.dispatch("deactivateGuide");

  // Hide the active guide layer and clear its source
  activeGuideLayer.setVisible(false);
  activeGuideSource.clear();

  // Show the audioguide layer
  audioguideLayer.setVisible(true);

  // Reset the map's padding
  olMap.getView().padding[2] = 0;

  // We could fit to available features here, but
  // field studies shown that users prefer the map
  // to remain where they were.
  // fitToAvailableFeatures();
};

const getOLMap = () => olMap;

export {
  initOLMap,
  getOLMap,
  updateFeaturesInMap,
  setBackgroundLayer,
  getLayerVisibility,
  enableCompass,
  disableCompass,
  enableGeolocation,
  disableGeolocation,
  getClosestStopNumberFromCurrentPosition,
  activateGuide,
  deactivateGuide,
  goToStopNumber,
};
