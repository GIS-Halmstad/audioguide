# The Audioguide App

## Real-world example

This platform was born out of the idea to create [Halmstad Stories](https://halmstadstories.se/). Hence, if you'd like to see a real-world example of the Audioguide App, please check out the [Halmstad Stories](https://halmstadstories.se/) website.

## Client Requirements

This app utilizes modern features and Web APIs, including top-level awaits (introduced in ES2022) and the WEBP image format. The minimum system requirements for browsers are:

- Android: Chrome 89 or later, Firefox 89 or later
- iOS 15 or later

## Internationalization (i18n)

The Audioguide App uses [i18next](https://www.i18next.com/) for internationalization. This means that all the text in the app, including the user interface and the guides, can be translated into different languages.

The translation files for the app itself are stored in the `public/locales` folder.

For the guides, the translations are stored in the same table as the geometries. Since we don't want to duplicate the geometries, we store the translations in separate columns for each language, with the column name being the language code (e.g. "en" for English or "sv" for Swedish - refer to ISO 639 for more language codes).

## Configuring the guides

The Audioguide App comes without built-in audio guides. You must provide the geometries, photos, audio files, optional videos to the app. The geospatial data for your audio guides can be sourced from two options:

- WFS service layers
- Feature collections from GeoJSON files

### Option 1: WFS Service

There are several options to serve data as WFS, but one common solution is to store the spatial data in a database (e.g., PostGIS) and expose them via the OGC WFS service using tools such as GeoServer or QGIS Server.

#### The Database

To set up the Audioguide App, you need to create two tables in your spatial database:

##### audioguide_lines

```sql
-- dest_halm.audioguide_lines definition

-- Drop table

-- DROP TABLE dest_halm.audioguide_lines;

CREATE TABLE dest_halm.audioguide_lines (
	"guideId" int2 NOT NULL,
	geom public.geometry(linestring, 3008) NOT NULL,
	"style" jsonb NULL,
	active bool NOT NULL,
	"activeLanguages" text NULL,
	categories text NULL,
	images text NULL,
	"sortOrder" int2 NULL,
	"title-sv" text NULL,
	"text-sv" text NULL,
	"length-sv" text NULL,
	"highlightLabel-sv" text NULL,
	"title-en" text NULL,
	"text-en" text NULL,
	"length-en" text NULL,
	"highlightLabel-en" text NULL,
	"title-de" text NULL,
	"text-de" text NULL,
	"length-de" text NULL,
	"highlightLabel-de" text NULL,
	"title-dk" text NULL,
	"text-dk" text NULL,
	"length-dk" text NULL,
	"highlightLabel-dk" text NULL,
	CONSTRAINT audioguide_lines_pk PRIMARY KEY ("guideId")
);
CREATE INDEX sidx_audioguide_lines_geom ON dest_halm.audioguide_lines USING gist (geom);
```

##### audioguide_points

```sql
-- dest_halm.audioguide_points definition

-- Drop table

-- DROP TABLE dest_halm.audioguide_points;

CREATE TABLE dest_halm.audioguide_points (
	id int4 NOT NULL,
	geom public.geometry(point, 3008) NULL,
	"style" jsonb NULL,
	"guideId" int2 NOT NULL,
	"stopNumber" int2 NOT NULL,
	images text NULL,
	"title-sv" text NULL,
	"text-sv" text NULL,
	"audios-sv" text NULL,
	"videos-sv" text NULL,
	"title-en" text NULL,
	"text-en" text NULL,
	"audios-en" text NULL,
	"videos-en" text NULL,
	"title-de" text NULL,
	"text-de" text NULL,
	"audios-de" text NULL,
	"videos-de" text NULL,
	"title-dk" text NULL,
	"text-dk" text NULL,
	"audios-dk" text NULL,
	"videos-dk" text NULL,
	CONSTRAINT audioguide_points_pk PRIMARY KEY (id),
	CONSTRAINT audioguide_points_unique_guide_stop UNIQUE ("guideId", "stopNumber"),
	CONSTRAINT audioguide_points_audioguide_lines_fk FOREIGN KEY ("guideId") REFERENCES dest_halm.audioguide_lines("guideId")
);
CREATE INDEX sidx_audioguide_points_geom ON dest_halm.audioguide_points USING gist (geom);
```

Note that some fields in the database tables are language-specific. These fields have names with the `-{lang}` suffix. To support additional languages, simply replace `-{lang}` with the desired language code and add as many columns as needed. For example, to support English and French, you would add columns named `title-en`, `title-fr`, `text-en`, `text-fr`, and so on.

#### The OGC WFS Service

Once you have the spatial data in a database, you need to expose it using a WFS service that can output features as `application/json`. Make sure to note the workspace, workspace's namespace, layers' SRS, as well as the URL to the WFS service. The Audioguide App expects the WFS layers to be called the same as the tables, i.e. `audioguide_lines` and `audioguide_points`.

### Option 2: GeoJSON files

If you want a simpler setup, without any WFS service nor database involved, you can opt for the static GeoJSON file solution. In this case you must:

- create two GeoJSON files (`lines.geojson` and `points.geojson`). Populate them with data. Refer to the provided database table structure above - the attributes must be called the same and have the same data types as in the database example.
- edit you Audioguide config (see next sections) and set `"useStaticGeoJSON"` to `true`.

## Configuring the App

Apart from the line and point features themselves, the Audioguide App has a configuration file that must be provided. This configuration tells the app which e.g. what projection should be used in the map, which background layers to use, what title should be displayed for the user, etc.

Similarly to the spatial data, this configuration can be provided in two ways: using an API or using a static JSON configuration file.

### Option A: The Hajk API

The Audioguide App is designed to work seamlessly with Hajk's API. If you already have the Hajk API running, you can configure the app to use your API instead of the built-in static configuration file. This allows you to easily update the app's configuration and push it to clients without requiring them to update the app itself.

### Option B: Static JSON configuration

Instead of the Hajk API, you can also use the static `simpleMapConfig.json` file to configure the Audioguide App.

## Example Configuration

### Static Configuration

To use the static configuration (option B), make sure to set `useStaticMapConfig` to `true` in your `public/appConfig.json` file. This will load the app's configuration from `public/staticMapConfig.json`. For more details on how to configure the map's extent, available projections, references to WMS layers used as backgrounds, and more, please refer to the `staticMapConfig.json` file.

### Using Hajk's API to Retrieve Configuration

If you want to retrieve the configuration from Hajk's API, make sure to include the following keys in your `public/appConfig.json` file. The first three keys determine which configuration to load and from where:

```jsonc
{
  // Settings for loading the app configuration
  "useStaticMapConfig": false, // Do not use the static configuration
  "mapServiceBase": "http://localhost:3002/api/v2", // URL to the Hajk API
  "mapName": "audio", // Name of the map that contains the Audioguide tool options (see below).

  // Other settings
  "showDemoMessage": false, // If true, a basic info will be shown on app launch saying that this is a demo app
  "showCookieNotice": false, // If true, a cookie notice will be shown on app launch
  "availableLanguages": [
    // A list of available languages with corresponding country flag codes
    { "lang": "sv", "flag": "se" },
    { "lang": "en", "flag": "gb" } // or perhaps you prefer `"flag": "us"` here?
  ],
  "fallbackLanguage": "sv", // The fallback language if the user's language is not supported
  "analytics": {
    "type": "plausible", // Analytics service. Currently only "plausible" is implemented.
    "domain": "audioguide.example.com", // Site identifier. Refer to Plausible's docs for more info.
    "apiHost": "https://plausible.io", // URL to service. Refer to Plausible's docs for more info.
    "trackLocalhost": false // If localhost should be included. Refer to Plausible's docs for more info.
  }
}
```

Hajk's API has the notion of _map configs_, that for some historical reasons is called `mapName` in the `appConfig.json` file. The map config that you request from the Hajk API, `audio` in the example above, must (apart from the usual Hajk map config properties) include the `audioguide` tool.

**The structure of this object configures the Audioguide App itself. This structure applies whether you use the Hajk API or provide this configuration as part of the `simpleMapConfig.json` file.**

```jsonc
{
  "type": "audioguide", // Tool name. Must be exacly "audioguide".
  "index": 0, // Sort order among other tools. Currently not used.
  "options": {
    // Whether to use the WFS (option 1) or static GeoJSON (option 2) to read geographic features.
    "useStaticGeoJSON": false,

    // When using static GeoJSON, it is possible to tell the application which
    // projection the features are in. Default (null) is WGS84, which is the
    // only projection supported by the most recent GeoJSON specification. Older
    // applications could, however, create GeoJSON with different projections,
    // hence the possibility to provide this information.
    "staticGeoJSONProjection": "EPSG:4326",

    // If using WFS, we must provide more connection details.
    "serviceSettings": {
      "url": "http://localhost:8080/geoserver/ows", // URL to WFS service that exposes the audioguide_lines and audioguide_points layers
      "srsName": "EPSG:3008", // SRS
      "featureNS": "https://pg.halmstad.se", // Workspace's namespace
      "featurePrefix": "pg" // Workspace name
    },
    "preselectedCategories": ["1"], // Specify which categories are selected on start. Set to empty to start with all selected.
    "title": "Audioguide",
    "description": "Audioguide tool",
    "audioguideAttribution": "Destination Halmstad, Halmstads kommun", // Used as main attribution, i.e. it should specify the audioguide tool's "owner". Shown in the About panel.
    "audioguideLayersAttribution": "Halmstads kommun", // Used to specify the owner/copyright holder of the audioguide map layers (i.e. audioguide_lines and audioguide_points). Shown in the About panel.
    "target": "left", // Hajk-specific, currently not used
    "position": "right", // Hajk-specific, currently not used
    "visibleAtStart": true, // Hajk-specific, currently not used
    "visibleForGroups": [] // Hajk-specific, relevant only if you serve this config via Hajk's API and have the ActiveDirectory filtering enabled
  }
}
```

### Configuring the OpenLayers map using the `map` property in `mapConfig`

There are a couple of OpenLayers-specific settings that you can put in your map config that are sent directly to the OpenLayers' `View`.
The following options from `mapConfig.map` are sent to `ol.View` when the View is initiated:

```js
center: mapConfig.map.center,
constrainOnlyCenter: mapConfig.map.constrainOnlyCenter,
constrainResolution:
  mapConfig.map.constrainResolutionMobile ?? mapConfig.map.constrainResolution,
extent: mapConfig.map.extent.length > 0 ? mapConfig.map.extent : undefined,
maxZoom: config.map.maxZoom || 24,
minZoom: mapConfig.map.minZoom || 0,
projection: mapConfig.map.projection,
resolutions: mapConfig.map.resolutions,
zoom: mapConfig.map.zoom
```

In addition, the `hitTolerance` parameter is sent to the `ol.interaction.Select` constructor:

```js
hitTolerance: mapConfig.map.hitTolerance || 0;
```

Finally, there's one more option available which comes in handy when you want to run the Audioguide App as a static app, without any dependencies from external APIs or OGC (WMS) services. This option tells the Audioguide App to rely on the OpenStreetMap as a background. Please note that this will effectivly disable any other background layers you may have configured in your map config (the `layerswitcher` tool's options).

```js
osmBackgroundOnly: false; // Set to true to use OSM and disable all other backgrounds
```

## Adding guides, including media assets, and styling them

### Styling guide lines and points using the `style` attribute in tables

In order to make the guide features (both lines and points) look different depending on the guide, there is a `style` column in both database tables. The type of this column is `jsonb`. They can be `NULL`, but it's recommended to set different styling for the different guides.

If a style property exists on the parent line feature, but is lacking on a point feature, the point feature will inherit its parent's styling. E.g. if a guide's line has `strokeColor: "red"`, but none of the points corresponding to that guide have any `strokeColor` value, all points of that guide will become red.

To set styling, use the following format (make sure to remove the comments!):

```jsonc
// The values below are also the defaults that will be applied if `style` is `NULL` or `{}`
{
  // Affects points and lines
  "strokeColor": "orange",
  "strokeWidth": 2

  // Affects points only, but can be set on line feature.
  // This will make all points that belong to this guide to inherit these values.
  "fillColor": "orange",
  "circleRadius": 5,
}
```

### Media assets

This section describes how to add media assets (images, audio, and video files) to the Audioguide App.

As you may have noticed, the database tables include some columns that are meant to be used to link each geometric feature with one-to-many assets. The `audioguide_points` table contains `audios`, `videos`, and `images`, while the `audioguide_lines` table contains `images` only. Each of these columns' values should be _a comma-separated string of either relative or absolute URLs_. `NULL` is also an allowed value.

The linked assets will be shown in the app in the corresponding place in the UI.

#### Recommended structure for relative URLs to media assets

If you wish to use relative URLs, here's the recommended approach.

The assets must be placed inside the corresponding directory within `public/media/{guideId}/{optional stopNumber if point feature}/{"images"|"audios"|"videos"}/{fileName.extension}`.

##### Important note regarding localization of audio and video files

To provide localized versions of audio and video files, it is recommended to **use the `{lang}-` prefix** in the filename, e.g. `en-Guide1-Stop3.m4a` or `sv-Guide1-Stop3.m4a`. When referring to these files in the database, use the language-specific column, e.g. `audios-sv` to refer to the Swedish audio file, e.g. `sv-Guide1-Stop3.m4a`. The same procedure applies for videos.

##### Important note regarding image thumbnails

In order to reduce bandwidth usage, the app expects images to exist in two copies: one main, called e.g. `image-1.webp` and one thumbnail, called `image-1-thumbnail.webp`. So it's the `-thumbnail` part that should be added just in front of the file extension. However, in the database, you should only refer to the original filename, without the `-thumbnail` part.

For example, consider the following data in the table:

```sql
SELECT "guideId", "stopNumber", images
FROM audioguide_points
ORDER BY "guideId", "stopNumber";

guideId|stopNumber|images           |
-------+----------+-----------------+
      1|         1|1.jpg,2.jpg,3.jpg|
      1|         2|4.jpg            |
      2|         1|1.jpg            |
      2|         2|2.jpg            |
```

Let's take a closer look at the first two lines of the results above.

The results imply that the app will expect the following files to exist:

```sh
└── media
    ├── 1                             <-- guideId
    │   ├── 1                         <-- stopNumber
    │   │   ├── audios
    │   │   │   └── audio.m4a         <-- audio file for the first stop on the guide with ID 1
    │   │   └── images
    │   │       ├── 1.jpg             <-- image for the first stop on the guide with ID 1
    │   │       ├── 2.jpg             <-- another image for the first stop on the guide with ID 1
    │   │       └── 3.jpg             <-- yet another image for the first stop on the guide with ID 1
    │   ├── 2
    │   │   ├── audios
    │   │   │   └── second_stop.m4a   <-- audio file for the second stop on the guide with ID 1
    │   │   └── images
    │   │       └── 4.jpg             <-- image for the second stop on the guide with ID 1
    │   └── images
    │       └── 1.jpg                 <-- image to show on the overview page for guide with ID 1
    └── 2                             <-- guideId
        ├── 1
        │   ├── audios
        │   │   └── 1.m4a             <-- audio file for the first stop on the guide with ID 2
        │   └── images
        │       └── 1.jpg
        └── 2
            ├── audios
            │   └── another_audio_file.m4a <-- audio file for the first stop on the guide with ID 2
            └── images
                └── 2.jpg
```

And the result of the configuration above is that:

- The first stop in the guide with `guideId` 1 will display three images: `1.jpg,2.jpg,3.jpg`.
- The second stop in the guide with `guideId` 1 will display `4.jpg`.
- The first stop in the guide with `guideId` 2 will display `1.jpg`.
- The second stop in the guide with `guideId` 2 will display `2.jpg`.

## Available start-up URL parameters

The Audioguide App accepts some optional URL hash parameters (the part of the URL string that comes directly after the `#` character). They can be used to control the app's initial settings on launch. The allowed parameters are:

- `c`: the category that will be pre-selected.
  - Users can pre-select multiple categories, just ensure to send a comma-separated list.
  - The categories must have corresponding translation keys in the translation files for all languages you want to support. Take a look at the `guideCategories` property in the translation files.
- `g`: makes it possible to start the app with a certain guide pre-selected. The value of `g` must match the value of `guideId` in the line features table.
- `p`: makes it possible to start the app with a specific point in a guide pre-selected. The value of `p` must correspond to the `stopNumber` value in the point features table. _Note that this requires the `g` parameter to be present as well (otherwise there is no way to know which point should be selected, as `stopNumber`s are not unique in the table)_.
- `a`: if `g` (and optionally `p`) are supplied, the guide/point will by default be started in preview mode. By setting `a=1`, this behavior will changed and initiate the app with the selected guide/point in active mode (i.e. with the guide activated, the point selected, player ready to start playing, etc).
- `lng`: the language to be used in the application - both for the UI and the content. Refer to the [Internationalization section](#internationalization-i18n) for more information.

## Styling and branding

A lot of Audioguide's look and feel can be customized. The important places to look out for include:

- `public/navbar-logo.svg`
- `public/bottom-ornament.svg`
- `public/custom.css`
- The map configuration (or `public/staticMapConfig.json`, if you're using static map config). Look for the `ui` property and its children, such as:
  - `colors.primary`: to set a default primary color
  - `injectCustomCss`: set to `true` to inject the contents of `public/custom.css`. This lets you further override CSS variables used to style the app. _Note that you must set both this and `colors.primary` to have full control on colors._
  - `darkMode`: `true`, `false` or `"auto"`
  - `theme`: `"md"`, `"ios"` or `"auto"`

## Statistics

It is possible to configure Audioguide to use Plausible to gather user statistics data, such as which guides are used mostly, how users start guides, etc.

Refer to the section on `public/appConfig.json` and its `analytics` property to connect Audioguide to your Plausible instance.

Below is a documentation of which events Audioguide sends. Refer to Plausible documentation to see how you add those events to your instance.

Note that some events contain a combined value of both `guideId` and `stopNumber`, called `guideIdStopNumber`. This is not an ideal solution, as it does duplicate some information. The motivation behind this design choice was to provide administrators with a convenient way to see combined values in the UI, while also keeping the number of events sent to Plausible to a minimum. If you're an administrator, you might find it easier to filter on `guideIdStopNumber` in the Plausible UI, rather than needing to use two separate filters, one for `guideId` and one for `stopNumber`.

| Event name                | Event data                                                         | Triggered by                                                                                                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `loadSuccess`             | -                                                                  | Successful initial app load.                                                                                                                                                                                                  |
| `loadError`               | `reason: string`                                                   | Failed initial app load.                                                                                                                                                                                                      |
| `guideClickedInPhotoList` | `guideId: number`                                                  | User clicked on guide in the photos card view. Guide's preview sheet is shown.                                                                                                                                                |
| `guideClickedInShortList` | `guideId: number`                                                  | User clicked on guide in the short list view. Guide's preview sheet is shown.                                                                                                                                                 |
| `guideClickedInMap`       | `guideId: number, stopNumber?: number, guideIdStopNumber?: string` | User clicked on guide in the map view. Also contains `stopNumber` and the combined `guideIdStopNumber`, if a specific point was clicked. Guide's preview sheet is shown.                                                      |
| `guideActivated`          | `guideId: number`                                                  | User clicked on "Start guide" on the preview sheet. Guide is activated.                                                                                                                                                       |
| `guideDeactivated`        | `guideId: number, stopNumber: number, guideIdStopNumber: string`   | An active guide is closed by the user. `stopNumber` is the point at which guide was deactivated. `guideIdStopNumber` is the combined value.                                                                                   |
| `guideStepShown`          | `guideId: number, stopNumber: number, guideIdStopNumber: string`   | A point in a guide becomes the active point. User can trigger this in two ways: a) a guide's initial activation, or b) user navigates between stops (using previous/next buttons). `guideIdStopNumber` is the combined value. |

## Deploy notes

The app is fully static and can be deployed using any web server. The recommended approach however, especially if you already use Hajk's API to retrieve the Audioguide App's configuration, is to use Hajk API's static exposer functionality.

Basically, build the app with `npm run build`. This will result in a `www` folder. Rename it to anything you like (e.g., `audioguides`) and put it in `{hajkBackend}/static/audioguides`. Next, tell Hajk's API to expose this directory by adding this directive to the `.env` file: `EXPOSE_AND_RESTRICT_STATIC_AUDIOGUIDE=`. Refer to Hajk's documentation for further information.

## FAQ

### Can I format the text?

Yes, you can! Value of the text string that you enter into the `text` column in both database tables can be formatted using Markdown. The Audioguide App uses `react-markdown`, which in its turn follows the CommonMark syntax. Please refer to its documentation for details or [follow this quick guide](https://commonmark.org/help/).

Regarding line breaks: to create a new paragraph, type `\n\n` where you want the break to occur. E.g. `This is **some bold text**. \n\nAnd here's a new paragraph.`. This will render to:

> This is **some bold text**.

> And here's a new paragraph.

### How can I specify what's shown on the About page?

You can customize the contents of the about page by modifying the `aboutPageContentHtml` property in the translation files. You can format the contents using valid HTML. If you want to create an external link, however, you must tell the application not to treat this link as an app link but rather an external web site. Here's an example of how it should look (note the escaped quotation marks, as we're inside JSON):

```json
"Here's a <a href=\"https://www.halmstad.se\" class=\"external link\" target=\"_system\">link</a>."
```

### I don't want the app to start with all the available categories visible. Is that possible?

Yes! You have two options:

- A: Use the `c` hash parameter. See [Available start up URL parameters](#available-start-up-url-parameters) for more info.
- B: Set a value to `preselectedCategories` in the map config. The value must be an array of strings and contain only valid categories. This way users that reach your app without any value in the `c` hash param will see these categories as pre-selected on start.

### How do I use this app as a fully static app?

There are three settings you must change in order to tell the app to do three separate things:

1. In `public/appConfig.json`, set `useStaticMapConfig` to `true`. _Why? To tell the app that to grab its configuration from a static JSON file, effectively eliminating the need of the Hajk backend and its API._
1. In `public/simpleMapConfig.json` locate the `audioguide` tool's options and set the `useStaticGeoJSON` property to `true`. _Why? To tell the app to read its audioguide geometries (the lines and points) from two static GeoJSON files, effectively eliminating the need of a WMS service._
1. In `public/simpleMapConfig.json`, in `mapConfig.map`, locate `osmBackgroundOnly` and set it to `true`. _Why? Because by using the OpenStreetMap as the background layer, you eliminate the need of supplying your own background from a WMS service._

When configured like this, the Audioguide App becomes a fully static app, requesting data only from your server (and the OpenStreetMap WMTS service, of course).

---

### Vite

There is a [Vite](https://vitejs.dev) bundler setup. It compiles and bundles all "front-end" resources. You should work only with files located in `/src` folder. Vite config located in `vite.config.js`.

#### HTTPS in development

If you want Vite to serve the project over HTTPS during development (handy to test certain features that require a secure connection, such as Geolocation), you must do the following:

1. Generate SSL certificates: You'll need SSL certificates for HTTPS. You can generate a self-signed certificate for development purposes using tools like OpenSSL. Here's a basic command to generate a self-signed certificate:

```shell
openssl req -x509 -out localhost.crt -keyout localhost.key \
  -newkey rsa:2048 -nodes -sha256 \
  -subj '/CN=localhost' -extensions EXT -config <( \
   printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")

```

2. Uncomment the `https` section in vite.config.js, so you have this part active:

```js
https: {
  key: fs.readFileSync("localhost.key"),
  cert: fs.readFileSync("localhost.crt"),
},
```

3. Start the development server as usual with `npm run dev`.1

### Assets

Assets (icons, splash screens) source images located in `assets-src` folder. To generate your own icons and splash screen images, you will need to replace all assets in this directory with your own images (pay attention to image size and format), and run the following command in the project directory:

```sh
framework7 assets
```

Or launch UI where you will be able to change icons and splash screens:

```sh
framework7 assets --ui
```
