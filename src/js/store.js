import { createStore } from "framework7/lite";

const store = createStore({
  state: {
    loading: true,
    appConfig: {},
    mapConfig: {},
    allLines: [],
    allPoints: [],
    allCategories: [],
    selectedCategories: [],
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
    //   setSelectedCategories({ state }, v) {
    //     console.log("New Selected Categories: ", v);
    //     // When selected categories change, we want to
    //     // reflect that in the lines and points too.
    //     const s = state.allLines
    //       .map((f) => {
    //         let match = false;
    //         const cats = f.get("categories").split(",");
    //         cats.forEach((c) => {
    //           if (v.has(c)) {
    //             match = true;
    //           }
    //         });
    //         return match ? f : undefined;
    //       })
    //       .filter((f) => f !== undefined);
    //     console.log("selectedLines: ", s);
    //     state.selectedLines = s;

    //     state.selectedCategories = v;
    //   },
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
    allCategories({ state }) {
      return state.allCategories;
    },
    selectedCategories({ state }) {
      return state.selectedCategories;
    },
    serviceSettings({ state }) {
      return state.mapConfig.mapConfig.tools.find(
        (t) => t.type === "audioguide"
      ).options.serviceSettings;
    },
    selectedLines({ state }) {
      console.log(
        "Will only grab lines from categories:",
        state.selectedCategories
      );
      return state.allLines;
    },
  },
});
export default store;
