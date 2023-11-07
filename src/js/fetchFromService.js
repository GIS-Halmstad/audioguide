import { GeoJSON, WFS } from "ol/format";

import store from "./store";

const fetchFromService = async (type = "line", filter) => {
  const { srsName, featureNS, featurePrefix, url } =
    store.getters.serviceSettings.value;
  // generate a GetFeature request
  const featureRequest = new WFS().writeGetFeature({
    srsName,
    featureNS,
    featurePrefix,
    featureTypes: [type === "line" ? "audioguide_line" : "audioguide_point"],
    outputFormat: "application/json",
    // filter: andFilter(
    //   likeFilter("name", "Mississippi*"),
    //   equalToFilter("waterway", "riverbank")
    // ),
  });

  try {
    // then post the request and add the received features to a layer
    const response = await fetch(url, {
      method: "POST",
      body: new XMLSerializer().serializeToString(featureRequest),
    });

    const json = await response.json();
    const features = new GeoJSON().readFeatures(json);
    // this.#localObserver.publish("fetchError", null);
    return features;
  } catch (error) {
    // this.#localObserver.publish("fetchError", error);
    console.error(error);
    return [];
  }
};

export { fetchFromService };
