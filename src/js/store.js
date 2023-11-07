import { createStore } from "framework7/lite";

const store = createStore({
  state: {
    loading: false,
    appConfig: {},
    mapConfig: {},
  },
  actions: {
    setAppConfig({ state }, appConfig) {
      state.appConfig = appConfig;
    },
    async getMapConfig({ state }) {
      state.loading = true;
      const response = await fetch(
        `${state.appConfig.mapServiceBase}/config/${state.appConfig.mapName}`
      );
      const json = await response.json();
      state.mapConfig = json;
      state.loading = false;
    },
    addProduct({ state }, product) {
      state.products = [...state.products, product];
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
