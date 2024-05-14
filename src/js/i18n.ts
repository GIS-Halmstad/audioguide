import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { log } from "./logger";

// An outer try/catch, in case we fail loading the app config
try {
  const appConfigResponse = await fetch("appConfig.json");

  // Extract the parameters we need for I18N from the app config
  const { availableLanguages, fallbackLanguage } =
    await appConfigResponse.json();

  // Prepare an object that will hold our language resources
  const resources = {};

  // Import resource for each of the languages specified in app config
  for await (const lang of availableLanguages) {
    // An inner try/catch, for each individual language resource.
    // Failing to load one must not stop the rest from proceeding.
    try {
      const resource = await fetch(`locales/${lang}/translation.json`);
      const json = await resource.json();
      console.log("resource: ", json);
      resources[lang] = json;
    } catch (error) {
      console.error("Failed to load I18N resource for language:", lang, error);
    }
  }

  log("Imported resources for languages:", resources);

  // Initiate I18N
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      debug: true,
      fallbackLng: fallbackLanguage,
      supportedLngs: availableLanguages,
      resources,
      interpolation: {
        escapeValue: false, // react already safes from xss
      },
    });
} catch (error) {
  console.error("Failed to initiate I18N:", error);
}

export default i18n;
