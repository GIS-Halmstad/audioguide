import { GeoJSON, WFS } from "ol/format";

import store from "./store";

const fetchFromService = async (type = "line") => {
  const { srsName, featureNS, featurePrefix, url } =
    store.state.mapConfig.tools.audioguide.serviceSettings;
  const useStaticGeoJSON =
    store.state.mapConfig.tools.audioguide.useStaticGeoJSON || false;
  const viewProjection = store.state.mapConfig.map.projection;
  const staticGeoJSONProjection =
    store.state.mapConfig.tools.audioguide.staticGeoJSONProjection || null;

  try {
    let response: Response,
      json = null;

    if (useStaticGeoJSON === true) {
      // If configured to use static GeoJSON, load from a file.
      const filename = type === "line" ? "lines.geojson" : "points.geojson";
      response = await fetch(filename);
      json = await response.json();
    } else {
      // If configure to use the WFS service, generate a GetFeature request.
      const featureRequest = new WFS().writeGetFeature({
        srsName,
        featureNS,
        featurePrefix,
        featureTypes: [
          type === "line" ? "audioguide_lines" : "audioguide_points",
        ],
        outputFormat: "application/json",
      });
      // Post the request and add the received features to a layer
      response = await fetch(url, {
        method: "POST",
        body: new XMLSerializer().serializeToString(featureRequest),
      });
      json = await response.json();
    }

    // Either way (static GeoJSON or WFS), we got some JSON features and want to parse them.
    const features = new GeoJSON().readFeatures(json, {
      // dataProjections is the projection of our features.
      // OL will do a best effort to derive them from the source,
      // but sometimes it won't work as expected. Hence, sysadmin has the
      // option to set useStaticGeoJSON in mapConfig and adjust accordingly.
      ...(useStaticGeoJSON === true && staticGeoJSONProjection !== null
        ? { dataProjection: staticGeoJSONProjection }
        : {}),
      // featureProjection is the projection of our View. We want to explicitly convert
      // our features from whatever projection the originally are in and to our View's projection.
      featureProjection: viewProjection,
    });

    // Depending on if it's points or lines we fetch, we need to sort them differently.
    if (type === "point") {
      // Points should be sorted by stop number
      return features.sort((a, b) => a.get("stopNumber") - b.get("stopNumber"));
    } else {
      // Sorting lines is done like this: if there's a value in the `sortOrder` column, use it.
      // Else, let's see how many lines there are and randomize the position of the remaining ones,
      // by putting them at the end of the list
      const amountOfLines = features.length; // This will include inactive lines, but it doesn't matter here.

      return (
        features
          // Line features should first be filtered out if inactivated in the database.
          .filter((f) => f.get("active") !== false)
          // Then, if there's a numeric value in the `sortOrder` column,
          // use it. Else, set a random value at the end of the array.
          .map((f) => {
            if (Number.isFinite(f.get("sortOrder"))) {
              return f;
            } else {
              f.set("sortOrder", amountOfLines + Math.random());
              return f;
            }
          })
          // Next, sort on the sortOrder column.
          .sort((a, b) => a.get("sortOrder") - b.get("sortOrder"))
      );
    }
  } catch (error) {
    throw new Error(`Fetching ${type} geometries from service failed`, {
      cause: error,
    });
  }
};

export default fetchFromService;
