import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import { f7 } from "framework7-react";

import { Feature } from "ol";
import { LineString, Point } from "ol/geom";

import store from "./store";
import { info, debugEnabled } from "./logger";
import { updateFeaturesInMap } from "./openlayers/olMap";
import { getParamValueFromHash } from "./getParamValueFromHash";

// An outer try/catch, in case we fail loading the app config
try {
  const appConfigResponse = await fetch("appConfig.json");

  // Extract the parameters we need for I18N from the app config
  const { availableLanguages, fallbackLanguage } =
    await appConfigResponse.json();
  info(
    "[i18n.ts] Available languages according to appConfig: ",
    availableLanguages
  );

  // Prepare an object that will hold our language resources
  const resources = {};

  // Import resource for each of the languages specified in app config
  for await (const lang of availableLanguages) {
    // An inner try/catch, for each individual language resource.
    // Failing to load one must not stop the rest from proceeding.
    try {
      const resource = await fetch(`locales/${lang}/translation.json`);
      const json = await resource.json();
      info(`[i18n.ts] Loaded translation for language: ${lang}`, json);
      resources[lang] = json;
    } catch (error) {
      console.error("Failed to load I18N resource for language:", lang, error);
    }
  }

  // Provide a custom detector that reads from the hash parameter
  const lngDetector = new LanguageDetector();
  lngDetector.addDetector({
    name: "hashstring",
    lookup: () => getParamValueFromHash("lng"),
    cacheUserLanguage(lng, options) {},
  });

  // Initiate I18N
  i18n
    .use(lngDetector)
    .use(initReactI18next)
    .init({
      debug: debugEnabled,
      fallbackLng: fallbackLanguage,
      supportedLngs: availableLanguages,
      resources,
      interpolation: {
        escapeValue: false, // react already safes from xss
      },
      detection: {
        // order and from where user language should be detected
        order: [
          "hashstring",
          "querystring",
          "cookie",
          "localStorage",
          "navigator",
          "htmlTag",
        ],
      },
    });

  // Ensure to update HTML lang attribute…
  document.documentElement.lang = i18n.language;
  // …and make sure to keep it up-to-date when the language changes.
  i18n.on("languageChanged", (lng) => (document.documentElement.lang = lng));
} catch (error) {
  console.error("Failed to initiate I18N:", error);
}

/**
 * Translate some attributes in Features into the currently active language
 *
 * @return A list of Features that has been modified by adding four new attributes,
 * `title`, `text`, `length` and `highlightLabel`, with values from the currently
 * active language. If the currently active language is not supported (which
 * is determined by looking at the `activeLanguages` field) the Feature is
 * excluded from the list.
 */
export const translateLines = (): Feature<LineString>[] | [] => {
  // Determine which language is currently active and
  // transform the Features by reading certain properties
  // that are language-dependent and putting them into
  // the generic `title`, `text` and `length` properties.
  const lang = i18n.resolvedLanguage;

  const translatedLines = (
    store.state.unmodifiedAllLines as Feature<LineString>[]
  )
    .map((f) => {
      // Let's find out if this line is active for current language
      if (f.get("activeLanguages")?.split(",")?.includes(lang)) {
        // Grab language-specific data from the correct column
        f.set("title", f.get("title-" + lang) || "");
        f.set("text", f.get("text-" + lang) || "");
        f.set("length", f.get("length-" + lang) || "");
        f.set("highlightLabel", f.get("highlightLabel-" + lang) || "");
        return f;
      }
    })
    .filter((f) => f !== undefined);
  return translatedLines as Feature<LineString>[];
};

/**
 * Translate some attributes in Features into the currently active language.
 * @returns A list of Features that has been modified by adding four new attributes.
 * See `translateLines` for details as this function is analogous, but for Point features.
 */
export const translatePoints = (
  translatedLines: Feature<LineString>[]
): Feature<Point>[] | [] => {
  const lang = i18n.resolvedLanguage;
  const guideIdsOfTranslatedLines = translatedLines.map((f: Feature) => {
    return f.get("guideId");
  });

  const translatedPoints = (store.state.unmodifiedAllPoints as Feature<Point>[])
    .filter((f) => guideIdsOfTranslatedLines.includes(f.get("guideId")))
    .map((f) => {
      // Grab language-specific data from the correct column.
      f.set("title", f.get("title-" + lang) || "");
      f.set("text", f.get("text-" + lang) || "");

      // Regarding the media files, however, we don't want to set this into an empty string
      // as that would be interpreted as "the URL of this media file is '<empty string>'",
      // which in turn would show the HTML media element of <audio> or <video>, with that
      // empty string as value of the `src` attribute. To avoid it, we leave this field undefined.
      f.set("audios", f.get("audios-" + lang));
      f.set("videos", f.get("videos-" + lang));
      return f;
    });
  return translatedPoints;
};

const getValidCategories = (
  availableCategories: string[],
  categoriesToTest: string[]
) => {
  // If there are pre-selected categories, let's ensure that
  // they're valid (i.e. exist among available categories).
  const validCategories = categoriesToTest.filter((c: string) =>
    availableCategories.includes(c)
  );
  if (validCategories.length > 0) {
    return validCategories;
  } else {
    return availableCategories;
  }
};

export const translateLinesPointsAndCategories = () => {
  const translatedLines = translateLines();
  const translatedPoints = translatePoints(translatedLines);

  // We cannot assume that all guides will be available in all languages,
  // hence after changing language, we need to update the available categories.
  // Let's extract available categories from all line features (which by
  // now are limited to those available in the currently selected language).
  // We do a quick conversion Array->Set->Array to remove duplicates.
  const availableCategories: string[] = Array.from(
    new Set(
      translatedLines.flatMap((f: Feature<LineString>) =>
        f.get("categories").split(",")
      )
    )
  );

  // Let's see if user tries to filter categories by providing a value
  // to the `c` param in URL.
  let filteredCategories: string[] = [];
  const categoriesFromHashParam = getParamValueFromHash("c");

  //If `c` is not empty, let's validate whatever
  // is provided and use these categories.
  if (categoriesFromHashParam.length > 0) {
    filteredCategories = getValidCategories(
      availableCategories,
      categoriesFromHashParam
    );
  }
  // If no `c` was provided, let's check if there are pre-selected categories in
  // the map config. If so, validate and use whatever's valid.
  else {
    const preselectedCategories =
      store.state.mapConfig.tools.audioguide.preselectedCategories || [];
    filteredCategories = getValidCategories(
      availableCategories,
      preselectedCategories
    );
  }

  // It is crucial to FIRST set the filtered categories. This is because
  // the Store getter `filteredFeatures` reads the value of `filteredCategories`
  // and filters available guides accordingly. This means that if app initiates
  // in a language that has no guide available and hence no filtered categories,
  // this value would be 0. Next, when filtering guides, we'd be comparing if
  // each specific guide's category matches any of the available in `filteredCategories`.
  // So it's really important to ensure it's updated at an early stage.
  store.dispatch("setFilteredCategories", filteredCategories);

  // Next we're ready to dispatch more changes that will trigger updates to
  // the dynamic property `filteredFeatures` and subsequential, a re-render.
  store.dispatch("setTranslatedLinesPointsAndCategories", {
    translatedLines,
    translatedPoints,
    availableCategories,
  });
};

/**
 * @summary Handler for language changes
 * @description This function is called when the user changes the language
 *   in the language selection dropdown. It updates the language-dependent
 *   data in the store and in the OL Map.
 */
i18n.on("languageChanged", () => {
  translateLinesPointsAndCategories();

  // Since we can't assume that the state that the app was in when the language
  // changed will be possible to replicate after the language change, we need
  // to unset a couple of things. (The uncertainties arise because we can't assume
  // that all guides are available in all languages.)

  // Tell OL to deselect any features
  f7.emit("olFeatureSelected", []);

  // Unset categories filter
  f7.store.dispatch("setFilteredCategories", f7.store.state.allCategories);

  // Ensure that no guide remains active
  f7.store.dispatch("deactivateGuide");

  // Ensure that OL Map is updated with new, language-dependent data
  updateFeaturesInMap();
});

export default i18n;
