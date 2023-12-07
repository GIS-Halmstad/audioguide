import { createStore } from "framework7/lite/bundle";
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
    filteredCategories: getParamValueFromHash("c"),
    activeGuideObject: null,
    activeStopNumber: null,
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
    setFilteredCategories({ state }, v) {
      state.filteredCategories = v;
    },
    setActiveGuideObject({ state }, v) {
      state.activeGuideObject = v;
    },
    setActiveStopNumber({ state }, v) {
      state.activeStopNumber = v;
    },
    deactivateGuide({ state }) {
      state.activeStopNumber = null;
      state.activeGuideObject = null;
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
    allLines({ state }) {
      return state.allLines;
    },
    allPoints({ state }) {
      return state.allPoints;
    },
    allCategories({ state }) {
      return state.allCategories;
    },
    filteredCategories({ state }) {
      return state.filteredCategories;
    },
    // A dynamic property that returns only those lines and points
    // that match the category filter selection.
    filteredFeatures({ state }) {
      // Determine which line features should be shown by looking
      // into the selected categories state. Only lines
      // with at least one selected category should be shown.
      const filteredLineFeatures = state.allLines
        .map((f) => {
          let match = false;
          const currentFeaturesCategories = f.get("categories").split(",");
          currentFeaturesCategories.forEach((c) => {
            if (state.filteredCategories.includes(c)) {
              match = true;
            }
          });
          return match ? f : undefined;
        })
        .filter((f) => f !== undefined);

      // Each line feature has a unique ID, save them to an Array.
      const guideIdsOfFilteredLines = filteredLineFeatures.map((lf) =>
        lf.get("guideId")
      );

      // Filter point features by including only those who's parent
      // line feature is visible.
      const filteredPointFeatures = state.allPoints.filter((f) =>
        guideIdsOfFilteredLines.includes(f.get("guideId"))
      );

      // Put it all together and return so that OL can take care of it.
      return [...filteredLineFeatures, ...filteredPointFeatures];
    },
    activeGuideObject({ state }) {
      return state.activeGuideObject;
    },
    activeStopNumber({ state }) {
      return state.activeStopNumber;
    },
  },
});
export default store;
