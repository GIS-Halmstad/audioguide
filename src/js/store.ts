import { createStore } from "framework7/lite/bundle";
import { Feature } from "ol";
import { LineString, Point } from "ol/geom";

import {
  ActiveGuideObject,
  AppConfig,
  GeolocationStatus,
  MapConfig,
  StoreState,
  TranslatedLinesPointsAndCategoriesObject,
} from "../types/types";
import { log } from "./logger";

// We will load the appConfig.json dynamically, so admins can change things
// such as analytics settings or the URLs to layer services on-the-flight, without
// having to re-deploy the app.
// Let's prepare a couple of variables that will be populated with values further on.
let appConfig: AppConfig | null = null;
let appConfigLoadingError: Error | null = null;

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
  appConfigLoadingError = error as Error;
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
    loadingError: appConfigLoadingError,
    geolocationStatus: "disabled",
    northLock: false,
    loading: true,
    appConfig: appConfig,
    mapConfig: {},
    unmodifiedAllLines: [], // Lines prior i18n fixes
    unmodifiedAllPoints: [],
    allLines: [], // Lines after i18n fixes
    allPoints: [],
    allCategories: [],
    filteredCategories: [],
    activeGuideObject: null,
    activeStopNumber: null,
    selectedFeature: null,
  } as StoreState,

  actions: {
    trackAnalyticsPageview() {
      trackPageview();
    },
    trackAnalyticsEvent({}, { eventName, ...rest }) {
      trackEvent(eventName, { props: rest });
    },
    setLoadingError({ state }: { state: StoreState }, v: Error) {
      state.loadingError = v;
    },
    setGeolocationStatus(
      { state }: { state: StoreState },
      v: GeolocationStatus
    ) {
      state.geolocationStatus = v;
      // Remove all previous geolocation classes
      document
        .querySelector("html")
        ?.classList.remove(
          "has-geolocation-disabled",
          "has-geolocation-denied",
          "has-geolocation-granted",
          "has-geolocation-pending"
        );
      document.querySelector("html")?.classList.add(`has-geolocation-${v}`);
    },
    setNorthLock({ state }: { state: StoreState }, v: boolean) {
      state.northLock = v;
      if (v === true) {
        document.querySelector("html")?.classList.add(`has-north-lock`);
      } else {
        document.querySelector("html")?.classList.remove(`has-north-lock`);
      }
    },
    setLoading({ state }: { state: StoreState }, v: boolean) {
      state.loading = v;
    },
    setMapConfig({ state }: { state: StoreState }, mapConfig: MapConfig) {
      state.mapConfig = mapConfig;
    },
    setUnmodifiedAllLines(
      { state }: { state: StoreState },
      v: Feature<LineString>[]
    ) {
      state.unmodifiedAllLines = v;
    },
    setUnmodifiedAllPoints(
      { state }: { state: StoreState },
      v: Feature<Point>[]
    ) {
      state.unmodifiedAllPoints = v;
    },
    setFilteredCategories({ state }: { state: StoreState }, v: string[]) {
      state.filteredCategories = v;
    },
    setTranslatedLinesPointsAndCategories(
      { state }: { state: StoreState },
      v: TranslatedLinesPointsAndCategoriesObject
    ) {
      state.allLines = v.translatedLines;
      state.allPoints = v.translatedPoints;
      state.allCategories = v.availableCategories;
    },
    setActiveGuideObject(
      { state }: { state: StoreState },
      v: ActiveGuideObject
    ) {
      state.activeGuideObject = v;
      document.querySelector("html")?.classList.add("has-active-guide");
      trackEvent("guideActivated", {
        props: { guideId: v?.line.get("guideId") },
      });
    },
    setActiveStopNumber({ state }: { state: StoreState }, v: number) {
      state.activeStopNumber = v;
      log(
        `Activated stop number ${v} in guide ID ${state.activeGuideObject?.line.get(
          "guideId"
        )}`
      );
      const guideId = state.activeGuideObject?.line.get("guideId");
      const stopNumber = v;
      trackEvent("guideStepShown", {
        props: {
          guideId,
          stopNumber,
          guideIdStopNumber: `${guideId}-${stopNumber}`,
        },
      });
    },
    setSelectedFeature({ state }: { state: StoreState }, v: Feature | null) {
      state.selectedFeature = v;
    },
    deactivateGuide({ state }: { state: StoreState }) {
      // This time we must do tracking _before_ we deactivate
      // the guide (as it will unset the variables we want to track).
      const guideId = state.activeGuideObject?.line.get("guideId");
      const stopNumber = state.activeStopNumber as number;
      trackEvent("guideDeactivated", {
        props: {
          guideId,
          stopNumber,
          guideIdStopNumber: `${guideId}-${stopNumber}`,
        },
      });

      document.querySelector("html")?.classList.remove("has-active-guide");

      // Unset the active guide and stop number
      state.activeStopNumber = null;
      state.activeGuideObject = null;
    },
  },

  getters: {
    loadingError({ state }: { state: StoreState }) {
      return state.loadingError as Error | null;
    },
    geolocationStatus({ state }: { state: StoreState }) {
      return state.geolocationStatus as GeolocationStatus;
    },
    northLock({ state }: { state: StoreState }) {
      return state.northLock as boolean;
    },
    loading({ state }: { state: StoreState }) {
      return state.loading as boolean;
    },
    appConfig({ state }: { state: StoreState }) {
      return state.appConfig as AppConfig | null;
    },
    mapConfig({ state }: { state: StoreState }) {
      return state.mapConfig as MapConfig;
    },
    unmodifiedAllLines({ state }: { state: StoreState }) {
      return state.unmodifiedAllLines as Feature<LineString>[];
    },
    unmodifiedAllPoints({ state }: { state: StoreState }) {
      return state.unmodifiedAllPoints as Feature<Point>[];
    },
    allLines({ state }: { state: StoreState }) {
      return state.allLines as Feature<LineString>[];
    },
    allPoints({ state }: { state: StoreState }) {
      return state.allPoints as Feature<Point>[];
    },
    allCategories({ state }: { state: StoreState }) {
      return state.allCategories as string[];
    },
    filteredCategories({ state }: { state: StoreState }) {
      return state.filteredCategories as string[];
    },
    // A dynamic property that returns only those lines and points
    // that match the category filter selection.
    filteredFeatures({ state }: { state: StoreState }) {
      // Determine which line features should be shown by looking
      // into the selected categories state. Only lines
      // with at least one selected category should be shown.
      const filteredLineFeatures = state.allLines
        .map((f: Feature<LineString>) => {
          let match = false;
          const currentFeaturesCategories = f.get("categories").split(",");
          currentFeaturesCategories.forEach((c: string) => {
            if (state.filteredCategories.includes(c)) {
              match = true;
            }
          });
          return match ? f : undefined;
        })
        .filter((f) => f !== undefined);

      // Each line feature has a unique ID, save them to an Array.
      const guideIdsOfFilteredLines = filteredLineFeatures.map((lf) =>
        lf?.get("guideId")
      );

      // Filter point features by including only those who's parent
      // line feature is visible.
      const filteredPointFeatures = state.allPoints.filter((f) =>
        guideIdsOfFilteredLines.includes(f.get("guideId"))
      );

      // Put it all together and return so that OL can take care of it.
      return [...filteredLineFeatures, ...filteredPointFeatures];
    },
    activeGuideObject({ state }: { state: StoreState }) {
      return state.activeGuideObject;
    },
    activeStopNumber({ state }: { state: StoreState }) {
      return state.activeStopNumber;
    },
    selectedFeature({ state }: { state: StoreState }) {
      return state.selectedFeature;
    },
  },
});
export default store;
