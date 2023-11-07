import { createStore } from "framework7/lite";

const store = createStore({
  state: {
    loading: true,
    appConfig: {},
    mapConfig: {},
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
  },
});
export default store;
