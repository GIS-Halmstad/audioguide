import { createStore } from "framework7/lite";
import { getParamValueFromHash } from "./getParamValueFromHash";

const store = createStore({
  state: {
    loadingError: false,
    loading: true,
    appConfig: {},
    mapConfig: {},
    allLines: [],
    allPoints: [],
    allCategories: [],
    selectedCategories: getParamValueFromHash("c"),
    selectedGuideId: null,
    selectedPointId: null,
  },

  actions: {
    setLoadingError({ state }, v) {
      state.loadingError = v;
    },
    setLoading({ state }, v) {
      state.loading = v;
    },
    setAppConfig({ state }, appConfig) {
      state.appConfig = appConfig;
    },
    setMapConfig({ state }, mapConfig) {
      state.mapConfig = mapConfig;
    },
    setAllLines({ state }, v) {
      state.allLines = v;
    },
    setAllPoints({ state }, v) {
      state.allPoints = v;
    },
    setAllCategories({ state }, v) {
      state.allCategories = v;
    },
    setSelectedCategories({ state }, v) {
      state.selectedCategories = v;
    },
    setSelectedGuideId({ state }, v) {
      console.log("setting guideId: ", v);
      state.selectedGuideId = v;
    },
    setSelectedPointId({ state }, v) {
      console.log("setting pointId: ", v);
      state.selectedPointId = v;
    },
  },

  getters: {
    loadingError({ state }) {
      return state.loadingError;
    },
    loading({ state }) {
      return state.loading;
    },
    appConfig({ state }) {
      return state.appConfig;
    },
    mapConfig({ state }) {
      return state.mapConfig;
    },
    serviceSettings({ state }) {
      return state.mapConfig.mapConfig.tools.find(
        (t) => t.type === "audioguide"
      ).options.serviceSettings;
    },
    allLines({ state }) {
      return state.allLines;
    },
    allPoints({ state }) {
      return state.allPoints;
    },
    allCategories({ state }) {
      return state.allCategories;
    },
    selectedCategories({ state }) {
      return state.selectedCategories;
    },
    selectedGuideId({ state }) {
      return state.selectedGuideId;
    },
    selectedPointId({ state }) {
      return state.selectedPointId;
    },
    selectedFeatures({ state }) {
      let selectedLineFeatures = [];
      // First, let's see if a specific guideId has been selected. If so,
      // filter only that ID.
      if (state.selectedGuideId !== null) {
        selectedLineFeatures = state.allLines.filter(
          (f) => f.get("guideId") === state.selectedGuideId
        );
      } else {
        // Determine which line features should be shown by looking
        // into the selected categories state. Only lines
        // with at least one selected category should be shown.
        selectedLineFeatures = state.allLines
          .map((f) => {
            let match = false;
            const currentFeaturesCategories = f.get("categories").split(",");
            currentFeaturesCategories.forEach((c) => {
              if (state.selectedCategories.includes(c)) {
                match = true;
              }
            });
            return match ? f : undefined;
          })
          .filter((f) => f !== undefined);
      }

      // Each line feature has a unique ID, save them to an Array.
      const guideIdsOfSelectedLines = selectedLineFeatures.map((lf) =>
        lf.get("guideId")
      );

      // Filter point features by including only those who's parent
      // line feature is visible.
      const selectedPointFeatures = state.allPoints.filter((f) =>
        guideIdsOfSelectedLines.includes(f.get("guideId"))
      );

      // Put it all together and return so that OL can take care of it.
      return [...selectedLineFeatures, ...selectedPointFeatures];
    },
  },
});
export default store;
