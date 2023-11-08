import { createStore } from "framework7/lite";

const deriveDefaultSelectedCategoriesFromHash = () => {
  try {
    const cParam = new URLSearchParams(window.location.hash.substring(1)).get(
      "c"
    );
    console.log("cParam: ", cParam?.split(","));
    return (
      cParam
        ?.split(",") // Try to split…
        .map((e) => e.trim()) // …and trim to avoid whitespace.
        .filter((f) => f.length > 0) || [] // Remove any empty elements. Fallback to empty array.
    );
  } catch (error) {
    console.error(error);
    return [];
  }
};

const store = createStore({
  state: {
    loading: true,
    appConfig: {},
    mapConfig: {},
    allLines: [],
    allPoints: [],
    allCategories: [],
    selectedCategories: deriveDefaultSelectedCategoriesFromHash(),
  },

  actions: {
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
  },

  getters: {
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
    selectedFeatures({ state }) {
      // Determine which line features should be shown by looking
      // into the selected categories state. Only lines
      // with at least one selected category should be shown.
      const selectedLineFeatures = state.allLines
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
