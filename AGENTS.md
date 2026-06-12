# AGENTS.md

Guidance for AI coding agents working in this repository. Human-facing docs live in [README.md](README.md); this file focuses on architecture, conventions, and gotchas that aren't obvious from the code.

## What this app is

The **Audioguide App** is a mobile-first, map-based audio guide / tour player. Users browse guides (walking tours) on a map, preview them, then "activate" a guide to step through its stops — each stop has text, images, audio, and optional video. It powers [Halmstad Stories](https://halmstadstories.se/), but ships with **no built-in guides**: all content is supplied by the deployer via spatial data + config.

The app is a **static SPA** that can run fully standalone (static JSON + GeoJSON + OpenStreetMap) or against the [Hajk](https://github.com/hajkmap/Hajk) GIS backend's API. It builds to a `www/` folder and is also packaged as native iOS/Android apps via Capacitor.

## Tech stack

- **React 19** + **Framework7 9** (`framework7-react`) — mobile UI framework providing the navigation, sheets, panels, popups, and theming (iOS/MD themes).
- **OpenLayers 10** (`ol`) — the map, vector layers, geolocation, custom controls.
- **TypeScript 5** (strict), **Vite 7** bundler.
- **Framework7's lite store** (`framework7/lite/bundle` `createStore`) — global state. **Not** Redux/Zustand.
- **i18next** / **react-i18next** — i18n for both UI strings and guide content.
- **Capacitor 8** — native iOS/Android wrappers (`ios/`, `android/`).
- **proj4** — coordinate projection registration for the map.
- **Plausible** — optional, privacy-friendly analytics.

## Commands

| Task | Command |
|------|---------|
| Dev server (port 3000) | `npm run dev` |
| Production build → `www/` | `npm run build` |
| Lint (must pass with 0 warnings) | `npm run lint` |
| Lint + autofix | `npm run lint:fix` |
| Format | `npm run format` (check: `npm run format:check`) |
| Build + copy to iOS | `npm run build-capacitor-ios` |
| Build + copy to Android | `npm run build-capacitor-android` |

There is **no test suite**. Verify changes by running the dev server and exercising the UI. `npm run lint` enforces `--max-warnings 0`, so treat warnings as errors. Prettier is the formatter (config in `.prettierrc`); ESLint config is `eslint.config.mjs` (flat config; `eslint-config-prettier` disables conflicting style rules).

## Source layout

Only `/src` is application code (per Vite config `root: SRC_DIR`). Everything in `public/` is served as-is.

```
src/
  js/
    app.ts            # Entry point. Orchestrates startup: appConfig → mapConfig → features → render.
    store.ts          # Global Framework7 store (state/actions/getters). Single source of truth.
    i18n.ts           # i18next init + the translate*() functions that localize guide features.
    routes.ts         # Framework7 routes (/, /about/, /share/, /install/, panels, 404).
    fetchFromService.ts  # Loads line/point features from WFS or static GeoJSON.
    washMapConfig.ts  # Normalizes/sanitizes the raw map config (Hajk or static) into MapConfig.
    f7.ts, f7Helpers.ts  # Typed Framework7 instance + helpers (style parsing, show-guide-in-map).
    getAssets.ts      # Resolves media asset URLs (images/audio/video, thumbnails, {lang}- prefix).
    constants.ts      # Default styling + OL layer name constants.
    logger.ts         # log/info/warn/debug wrappers (debug gated by debugEnabled).
    openlayers/
      olMap.ts        # The map: init, layers, style functions, selection, geolocation, activation.
      olHelpers.ts    # createLayersFromConfig() — builds OL layers from map config.
      *Control.ts     # Custom OL controls: background switcher, geolocate, north-lock rotate.
  components/         # React/Framework7 components (App, sheets, cards, swipers, error screens).
  pages/              # Framework7 route pages (home, about, share, install-app, panels, 404).
  types/              # *.d.ts — types.d.ts is the main one (StoreState, MapConfig, AppConfig, etc.).
  css/, fonts/, assets/
public/
  appConfig.json      # Top-level runtime config (which map config to load, languages, analytics).
  staticMapConfig.json # Used when appConfig.useStaticMapConfig === true.
  locales/{sv,en,de,dk}/translation.json  # UI translations.
  media/{guideId}/...  # (deployer-supplied) guide media assets.
```

## How startup works (read [src/js/app.ts](src/js/app.ts) before touching boot order)

1. `store.ts` runs a **top-level `await fetch("appConfig.json")`** at import time. Failure is stored as `loadingError`, not thrown — the app then renders `ErrorApp` instead of `App`.
2. `app.ts` checks the OS (iOS < 15 → renders `UnsupportedOsApp`; the app relies on ES2022 top-level await + WEBP).
3. Loads the **map config** (Hajk API `${mapServiceBase}/config/${mapName}` or `staticMapConfig.json`), runs it through `washMapConfig`, registers projections via proj4, then fetches **line** and **point** features via `fetchFromService`.
4. Point features inherit their parent line's `style` as `parentStyle`.
5. `translateLinesPointsAndCategories()` localizes features for the initial language, then React mounts.

Two config layers — don't confuse them:
- **`appConfig.json`** — bootstrap config: where to get the map config, available languages, analytics.
- **map config** (`mapConfig`) — the map itself + the `tools.audioguide` options block (service settings, preselected categories, attribution). The audioguide-specific options live at `mapConfig.tools.audioguide`.

## State & data conventions

- **Global state is the Framework7 store** ([src/js/store.ts](src/js/store.ts)). Read via getters, mutate only via `store.dispatch("actionName", payload)`. Don't introduce a parallel state mechanism.
- Components access the store through the typed `f7` instance / Framework7-React store hooks; the store is also reachable as `f7.store`.
- **Map features are OpenLayers `Feature` objects**, not plain JS. Read attributes with `feature.get("guideId")`, etc. Guides are identified by `guideId`; stops within a guide by `stopNumber` (unique only within a guide — hence the combined `guideId-stopNumber` used in analytics).
- **i18n of guide content is column-based, not file-based.** Each feature carries language-suffixed attributes (`title-sv`, `text-en`, `audios-de`, …). `translateLines`/`translatePoints` in [src/js/i18n.ts](src/js/i18n.ts) copy the active language's columns into generic `title`/`text`/`length`/`audios`/`videos` attributes. A line is excluded entirely if the active language isn't in its `activeLanguages`. UI strings (vs. content) live in `public/locales/{lang}/translation.json`.
- Changing language wipes selection/active-guide/filter state (`i18n.on("languageChanged")` handler) because not every guide exists in every language.
- `store.getters.filteredFeatures` derives the visible line+point set from `filteredCategories`. Category filtering happens at the line level; points follow their parent line's visibility.

## Cross-cutting gotchas

- **Top-level `await`** is used in `store.ts` and `i18n.ts`. This sets the ES2022 / iOS 15 minimum and is intentional — don't "fix" it.
- **Errors during boot are captured into `loadingError`, not thrown**, so the app can render a graceful `ErrorApp`. Preserve this pattern when editing startup code.
- **`localStorage.overrideMapServiceBaseUrl`** lets a user override the API base at runtime (see `app.ts`).
- **URL hash params** drive initial state: `c` (categories), `g` (guideId), `p` (stopNumber), `a` (active vs preview), `lng` (language). Parsed via `getParamValueFromHash`. See README "Available start-up URL parameters".
- **Styling**: feature `style` is a JSONB object (`strokeColor`, `strokeWidth`, `fillColor`, `circleRadius`); points inherit line styles. Defaults live in [src/js/constants.ts](src/js/constants.ts). Parsed by `parseStyle` in `f7Helpers.ts`.
- **Media assets**: comma-separated URL strings in feature columns. Images need a `-thumbnail` sibling; localized audio/video use a `{lang}-` filename prefix. Resolution logic is in `getAssets.ts`; see README "Media assets".
- **Analytics is optional and mocked when absent** — `store.ts` provides no-op `trackEvent`/`trackPageview` unless `appConfig.analytics.type === "plausible"`. Add new tracked events through the store actions, and document them in the README's events table.
- Native projects (`ios/`, `android/`) are generated/managed by Capacitor and are **git-ignored except for committed config**; regenerate via the `build-capacitor-*` scripts rather than hand-editing build output.

## Conventions for changes

- Match the surrounding style: ES modules, named exports for helpers, default export for the store/components. Functional React components with hooks.
- Keep TypeScript strict-clean (`noUnusedLocals`/`noUnusedParameters` are on; prefix intentionally-unused args with `_`).
- Add new shared types to `src/types/types.d.ts`.
- Run `npm run lint && npm run format:check` before considering a change done.
- When adding config options, update **both** the relevant `.d.ts` type and the README documentation (the README is the deployer-facing contract).
