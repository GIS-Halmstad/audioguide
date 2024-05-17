import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import { Feature } from "ol";
import { LineString, Point } from "ol/geom";

import store from "./store";
import { info, debugEnabled } from "./logger";
import { updateFeaturesInMap } from "./openlayers/olMap";

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

  // Initiate I18N
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      debug: debugEnabled,
      fallbackLng: fallbackLanguage,
      supportedLngs: availableLanguages,
      resources,
      interpolation: {
        escapeValue: false, // react already safes from xss
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
      if (f.get("activeLanguages")?.includes(lang)) {
        // Grab translated data, fallback to default (which may exist
        // for legacy, untranslated data)
        f.set("title", f.get("title-" + lang) || f.get("title"));
        f.set("text", f.get("text-" + lang) || f.get("text"));
        f.set("length", f.get("length-" + lang) || f.get("length"));
        f.set(
          "highlightLabel",
          f.get("highlightLabel-" + lang) || f.get("highlightLabel")
        );
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
export const translatePoints = (): Feature<Point>[] | [] => {
  const lang = i18n.resolvedLanguage;
  const translatedPoints = (
    store.state.unmodifiedAllPoints as Feature<Point>[]
  ).map((f) => {
    f.set("title", f.get("title-" + lang) || f.get("title")); // Grab translated, fallback to default (for legacy data)
    f.set("text", f.get("text-" + lang) || f.get("text"));
    return f;
  });
  return translatedPoints;
};

export const translateLinesPointsAndCategories = () => {
  store.dispatch("setAllLines", translateLines());
  store.dispatch("setAllPoints", translatePoints());

  // We cannot assume that all guides will be available in all languages,
  // hence after changing language, we need to update the available categories.
  // Let's extract available categories from all line features (which by
  // now are limited to those available in the currently selected language).
  // We do a quick conversion Array->Set->Array to remove duplicates.
  const categories = Array.from(
    new Set(
      store.state.allLines.flatMap((f: Feature<LineString>) =>
        f.get("categories").split(",")
      )
    )
  );
  store.dispatch("setAllCategories", categories);
};

/**
 * @summary Handler for language changes
 * @description This function is called when the user changes the language
 *   in the language selection dropdown. It updates the language-dependent
 *   data in the store and in the OL Map.
 */
i18n.on("languageChanged", () => {
  translateLinesPointsAndCategories();

  // Ensure that OL Map is updated with new, language-dependent data
  updateFeaturesInMap();
});

export default i18n;
