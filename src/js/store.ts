import { createStore } from "framework7/lite/bundle";
import { getParamValueFromHash } from "./getParamValueFromHash";

// We will load the appConfig.json dynamically, so admins can change things
// such as analytics settings or the URLs to layer services on-the-flight, without
// having to re-deploy the app.
// Let's prepare a couple of variables that will be populated with values further on.
let appConfig = {};
let appConfigLoadingError = null;

// Let's try to fetch the appConfig.json.
try {
  const appConfigResponse = await fetch("appConfig.json");

  // If it's successful, let's parse it and save it so it can
  // be used as default when we set up our store further on.
  appConfig = await appConfigResponse.json();
} catch (error) {
  // If it failed, let's save the error. This variable will also
  // be used further on when we initiated the store. In this case,
  // the store will be initiated in a already-failed state, which will
  // lead the App to display an error message directly.
  appConfigLoadingError = error;
}

// We have two actions further down that expect these functions
// to exist. As we can not know (at this time) whether they'll be
// imported or not in the next step, we must provide a mock implementation.
let trackPageview = () => {};
let trackEvent = (
  eventName: string,
  eventData?: {
    props: {
      [propName: string]: string | number | boolean;
    };
  }
) => {};

// Now let's consult our appConfig to see if any analytics implementation
// has been configured.
if (appConfig?.analytics?.type === "plausible") {
  const { default: Plausible } = await import("plausible-tracker");

  const { domain, apiHost, trackLocalhost } = appConfig?.analytics || {};

  // Exports an instance that implements two necessary methods,
  // trackPageview and trackEvent. See store.ts for use.
  const TrackerPlausible = Plausible({
    domain,
    apiHost,
    trackLocalhost,
  });
  // Swap the mock implementation into the actual one
  trackPageview = TrackerPlausible.trackPageview;
  trackEvent = TrackerPlausible.trackEvent;
}

// Create the Store
const store = createStore({
  state: {
    loadingError: appConfigLoadingError, // null or error
    geolocationError: null,
    loading: true,
    appConfig: appConfig, // null (if appConfigLoadingError is set) or a valid appConfig
    mapConfig: {},
    allLines: [],
    allPoints: [],
    allCategories: [],
    filteredCategories: getParamValueFromHash("c"),
    activeGuideObject: null,
    activeStopNumber: null,
  },

  actions: {
    trackAnalyticsPageview() {
      trackPageview();
    },
    trackAnalyticsEvent({}, { eventName, ...rest }) {
      trackEvent(eventName, { props: rest });
    },
    setLoadingError({ state }, v) {
      state.loadingError = v;
    },
    setGeolocationError({ state }, v) {
      state.geolocationError = v;
    },
    setLoading({ state }, v) {
      state.loading = v;
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
      document.querySelector("html")?.classList.add("has-active-guide");
      trackEvent("guideActivated", {
        props: { guideId: v?.line.get("guideId") },
      });
    },
    setActiveStopNumber({ state }, v) {
      state.activeStopNumber = v;
      trackEvent("guideStepShown", {
        props: {
          guideId: state.activeGuideObject?.line.get("guideId"),
          stopNumber: v,
        },
      });
    },
    deactivateGuide({ state }) {
      // This time we must do tracking _before_ we deactivate
      // the guide (as it will unset the variables we want to track).
      trackEvent("guideDeactivated", {
        props: {
          guideId: state.activeGuideObject?.line.get("guideId"),
          stopNumber: state.activeStopNumber,
        },
      });

      document.querySelector("html")?.classList.remove("has-active-guide");

      // Unset the active guide and stop number
      state.activeStopNumber = null;
      state.activeGuideObject = null;
    },
  },

  getters: {
    loadingError({ state }) {
      return state.loadingError;
    },
    geolocationError({ state }) {
      return state.geolocationError;
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
