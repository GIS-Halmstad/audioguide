export type LayerType = "background" | "layer" | "system";

import { Feature } from "ol";
import { LineString, Point } from "ol/geom";
import { ServerType } from "ol/source/wms";

export type AppConfig = {
  analytics?: {
    apiHost: string;
    domain: string;
    trackLocalhost: boolean;
    type: string;
  };
  availableLanguages: { lang: string; flag: string }[];
  fallbackLanguage: string;
  mapName: string;
  mapServiceBase: string;
  showCookieNotice: boolean;
  showDemoMessage: boolean;
  useStaticMapConfig: boolean;
};

export type LayerConfig = {
  attribution: string;
  caption: string;
  content: string;
  customDpiList: object;
  customGetMapUrl: string;
  customRatio: number;
  date: string;
  displayFields: object;
  drawOrder: number;
  hideExpandArrow: boolean;
  hidpi: boolean;
  id: string;
  imageFormat: string;
  infobox: string;
  infoClickSortDesc: boolean;
  infoClickSortProperty: string;
  infoClickSortType: string;
  infoFormat: string;
  infoOwner: string;
  infoText: string;
  infoTitle: string;
  infoUrl: string;
  infoUrlText: string;
  infoVisible: boolean;
  internalLayerName: string;
  layers: string[];
  layersInfo: object;
  legend: string;
  legendIcon: string;
  maxZoom: number;
  minMaxZoomAlertOnToggleOnly: boolean;
  minZoom: number;
  opacity: number;
  owner: string;
  projection: string;
  searchDisplayName: string;
  searchFields: object;
  searchGeometryField: string;
  searchOutputFormat: string;
  searchPropertyName: string;
  searchShortDisplayName: string;
  searchUrl: string;
  secondaryLabelFields: string;
  serverType: ServerType;
  showAttributeTableButton: boolean;
  singleTile: boolean;
  tiled: boolean;
  timeSliderEnd: string;
  timeSliderStart: string;
  timeSliderVisible: boolean;
  type: string;
  url: string;
  useCustomDpiList: boolean;
  version: string;
  visibleAtStart: boolean;
  zIndex: number;
};

export type MapConfig = {
  activeDrawerOnStart: string;
  altShiftDragRotate: boolean;
  center: number[];
  colors: object;
  confirmOnWindowClose: boolean;
  constrainOnlyCenter: boolean;
  constrainResolution: boolean;
  constrainResolutionMobile: boolean;
  cookieUse3dPart: boolean;
  cqlFilterVisible: boolean;
  crossOrigin: string;
  defaultCookieNoticeMessage: string;
  defaultCookieNoticeUrl: string;
  doubleClickZoom: boolean;
  dragPan: boolean;
  drawerPermanent: boolean;
  drawerStatic: boolean;
  drawerVisible: boolean;
  drawerVisibleMobile: boolean;
  enableAppStateInHash: boolean;
  enableDownloadLink: boolean;
  extent: number[];
  extraPrintResolutions: object;
  geoserverLegendOptions: string;
  introductionEnabled: boolean;
  introductionShowControlButton: boolean;
  introductionSteps: object;
  keyboard: boolean;
  logo: string;
  logoDark: string;
  logoLight: string;
  mapcleaner: boolean;
  mapresetter: boolean;
  mapselector: boolean;
  maxZoom: number;
  minZoom: number;
  mouseWheelZoom: boolean;
  onFocusOnly: boolean;
  origin: number[];
  pinchRotate: boolean;
  pinchZoom: boolean;
  projection: string;
  resolutions: number[];
  shiftDragZoom: boolean;
  showCookieNotice: boolean;
  showRecentlyUsedPlugins: boolean;
  showThemeToggler: boolean;
  showUserAvatar: boolean;
  target: string;
  title: string;
  zoom: number;
  zoomDelta: object;
  zoomDuration: object;
};

export type StyleObject = {
  circleRadius: number;
  fillColor: string;
  onFillColor: string;
  strokeColor: string;
  strokeWidth: number;
};

export type StoreState = {
  activeGuideObject: ActiveGuideObject | null;
  activeStopNumber: number | null;
  allCategories: string[] | [];
  unmodifiedAllLines: Feature<LineString>[] | [];
  unmodifiedAllPoints: Feature<Point>[] | [];
  allLines: Feature<LineString>[] | [];
  allPoints: Feature<Point>[] | [];
  appConfig: AppConfig | null;
  filteredCategories: string[] | [];
  geolocationStatus: GeolocationStatus;
  loading: boolean;
  loadingError: Error | null;
  mapConfig: MapConfig;
  northLock: boolean;
  selectedFeature: Feature | null;
};

export type GeolocationStatus = "disabled" | "denied" | "granted" | "pending";

export type ActiveGuideObject = {
  line: Feature<LineString>;
  points: { [stopNumber: number]: Feature<Point> };
};

export type TranslatedLinesPointsAndCategoriesObject = {
  translatedLines: Feature<LineString>[] | [];
  translatedPoints: Feature<Point>[] | [];
  availableCategories: string[];
};
