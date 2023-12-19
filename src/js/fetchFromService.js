import { GeoJSON, WFS } from "ol/format";

import store from "./store";

const fetchFromService = async (type = "line") => {
  const { srsName, featureNS, featurePrefix, url } =
    store.state.mapConfig.tools.audioguide.serviceSettings;
  // generate a GetFeature request
  const featureRequest = new WFS().writeGetFeature({
    srsName,
    featureNS,
    featurePrefix,
    featureTypes: [type === "line" ? "audioguide_line" : "audioguide_point"],
    outputFormat: "application/json",
  });

  try {
    // then post the request and add the received features to a layer
    const response = await fetch(url, {
      method: "POST",
      body: new XMLSerializer().serializeToString(featureRequest),
    });

    const json = await response.json();
    const features = new GeoJSON().readFeatures(json);
    // Let's remove any line features that are inactivated in the DB.
    return features.filter((f) => f.get("active") !== false);
  } catch (error) {
    throw new Error(`Fetching ${type} geometries from service failed`, {
      cause: error,
    });
  }
};

export default fetchFromService;
