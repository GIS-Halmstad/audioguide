import { createStore } from "framework7/lite";

const store = createStore({
  state: {
    loading: true,
    appConfig: {},
    mapConfig: {},
    availableCategories: new Set(),
    selectedCategories: new Set(),
    allLines: [],
    selectedLines: [],
    allPoints: [],
    selectedPoints: [],
  },
  actions: {
    setAppConfig({ state }, appConfig) {
      state.appConfig = appConfig;
    },
    setMapConfig({ state }, mapConfig) {
      state.mapConfig = mapConfig;
    },
    setLoading({ state }, newValue) {
      state.loading = newValue;
    },
    setAvailableCategories({ state }, newValue) {
      state.availableCategories = newValue;
    },
    setAllLines({ state }, newValue) {
      state.allLines = newValue;
    },
    setAllPoints({ state }, newValue) {
      state.allPoints = newValue;
    },
    setSelectedCategories({ state }, newValue) {
      console.log("New Selected Categories: ", newValue);
      // When selected categories change, we want to
      // reflect that in the lines and points too.
      const s = state.allLines
        .map((f) => {
          let match = false;
          const cats = f.get("categories").split(",");
          cats.forEach((c) => {
            if (newValue.has(c)) {
              match = true;
            }
          });
          return match ? f : undefined;
        })
        .filter((f) => f !== undefined);
      console.log("selectedLines: ", s);
      state.selectedLines = s;

      state.selectedCategories = newValue;
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
    allLines({ state }) {
      return state.allLines;
    },
    allPoints({ state }) {
      return state.allPoints;
    },
    availableCategories({ state }) {
      return state.availableCategories;
    },
    serviceSettings({ state }) {
      return state.mapConfig.mapConfig.tools.find(
        (t) => t.type === "audioguide"
      ).options.serviceSettings;
    },
    selectedLines({ state }) {
      return state.selectedLines;
    },
  },
});
export default store;
