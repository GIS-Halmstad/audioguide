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
    return features;
  } catch (error) {
    store.dispatch("setLoadingError", true);
    console.error(error);
    return [];
  }
};

export default fetchFromService;
