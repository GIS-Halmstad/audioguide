# The Audioguide App

TBA

## Requirements

### The database

Create these two tables in your spatial database:

#### audioguide_line

```sql
-- public.audioguide_line definition

-- Drop table

-- DROP TABLE public.audioguide_line;

CREATE TABLE public.audioguide_line (
  "guideId" int2 NOT NULL,
  active bool NOT NULL DEFAULT true,
  title text NOT NULL,
  "text" text NOT NULL,
  categories text NULL,
  images text NULL,
  length text NOT NULL DEFAULT 0,
  "style" jsonb NULL,
  geom public.geometry(linestring, 3008) NOT NULL,
  CONSTRAINT audioguide_line_pk PRIMARY KEY ("guideId")
);
CREATE INDEX sidx_audioguide_line_geom ON public.audioguide_line USING gist (geom);
```

#### audioguide_point

```sql
-- public.audioguide_point definition

-- Drop table

-- DROP TABLE public.audioguide_point;

CREATE TABLE public.audioguide_point (
  id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
  "guideId" int2 NOT NULL,
  "stopNumber" int2 NOT NULL,
  title text NOT NULL,
  "text" text NOT NULL,
  images text NULL,
  audios text NULL,
  videos text NULL,
  "style" jsonb NULL,
  geom public.geometry(point, 3008) NOT NULL,
  CONSTRAINT audioguide_point_pkey PRIMARY KEY (id),
  CONSTRAINT audioguide_point_unique_guide_stop UNIQUE ("stopNumber", "guideId")
);
CREATE INDEX sidx_audioguide_point_geom ON public.audioguide_point USING gist (geom);
```

### The OGC WFS Service

Publish the tables described above using a WFS service can output features as `application/json`.

Ensure to note the _workspace_, workspace's _namespace_, layers' _SRS_ as well the _URL_ to the WFS service.

### The Hajk API

This app is made to work out-of-the-box with Hajk's API. This means that you should have a recent version of the Hajk API running, as you will need to add some settings to a map config file in order to configure this app.

## Example configuration

In order to tell the Audioguide app where to find the required Hajk API, you must add the following to `public/appConfig.json`:

```jsonc
{
  "mapServiceBase": "http://localhost:3002/api/v2", // URL to the Hajk API
  "mapName": "audio", // Name of the map that contains the Audioguide tool options (see below)
  "showDemoMessage": false, // If true, a basic info will be shown on app launch saying that this is a demo app
  "analytics": {
    "type": "plausible", // Analytics service. Currently only "plausible" is implemented.
    "domain": "audioguide.example.com", // Site identifier. Refer to Plausible's docs for more info.
    "apiHost": "https://plausible.io", // URL to service. Refer to Plausible's docs for more info.
    "trackLocalhost": false // If localhost should be included. Refer to Plausible's docs for more info.
  }
}
```

In addition, you must add the Audioguide tool options to the map config that you specified in `appConfig.json`. Here's an example configuration:

```jsonc
{
      "type": "audioguide",
      "index": 0,
      "options": {
        "serviceSettings": {
          "url": "http://localhost:8080/geoserver/ows", // URL to WFS service
          "srsName": "EPSG:3008", // SRS
          "featureNS": "https://pg.halmstad.se", // Workspace's namespace
          "featurePrefix": "pg" // Workspace name
        },
        "title": "Audioguide",
        "description": "Audioguide tool",
        "audioguideLayersAttribution": "Halmstads kommun", // Used to specify the owner of audioguide layers and the tool itself (shown in About page)
        "aboutPageContentHtml": "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas vitae mi vitae purus congue convallis. Curabitur condimentum dolor sed erat rhoncus mollis. Mauris sed massa vehicula, bibendum diam sit amet, semper massa. Praesent cursus rhoncus mattis. Sed sed laoreet lectus, ac aliquet ipsum. Quisque vel risus ante. Phasellus vel mauris mauris. Nunc rhoncus mi enim, vitae facilisis magna imperdiet nec. Maecenas nec quam ipsum. Vestibulum bibendum interdum elit vel laoreet. Nulla facilisi. Fusce efficitur nisi non tristique pulvinar.</p><p>Nulla in iaculis nibh. Sed sodales eget risus nec lobortis. Pellentesque at dictum nulla, at ultrices mi. Phasellus feugiat, nisi quis egestas facilisis, ex nisl varius nulla, id interdum justo massa volutpat nisl. Integer congue, magna vitae consequat imperdiet, neque enim viverra nibh, eu aliquam nisi sem eget justo. Duis ullamcorper est ac ex dignissim, sit amet commodo massa congue. Vestibulum turpis arcu, interdum eget purus sit amet, rhoncus molestie risus. Integer fringilla molestie eros id pretium. Mauris sit amet diam id urna pulvinar auctor. Mauris sollicitudin malesuada elit in volutpat. Suspendisse blandit erat eget magna porta convallis. Quisque sollicitudin at odio nec maximus. Pellentesque ut ante id nisl iaculis egestas. Cras vestibulum elit ac sagittis semper.</p><p>In eleifend mattis nisi. Cras sit amet interdum nunc. Ut ac libero mattis, sodales orci id, aliquet mi. Curabitur lacinia tristique magna at consectetur. Fusce tempor ante sed aliquam viverra. Curabitur dapibus vehicula lorem ut feugiat. Fusce gravida nunc ligula, nec viverra massa interdum imperdiet. Proin eget velit imperdiet, eleifend nisl sed, suscipit elit. In nunc tellus, commodo nec pharetra nec, tempor porta tortor. Nullam viverra in magna ut lobortis. Pellentesque sed eros non urna varius sollicitudin. Sed maximus orci ac ultrices pellentesque. Nulla mollis sodales diam, nec luctus magna feugiat vel.</p><p>Vestibulum congue a dolor eget auctor. Aenean pulvinar laoreet orci, ac aliquet neque fringilla sit amet. Mauris tellus ligula, aliquet eu leo ac, efficitur ultricies mauris. Maecenas eget urna mi. Aenean nulla dolor, volutpat ut diam id, consequat finibus neque. Pellentesque tincidunt nulla est. Vestibulum ut ex dui.</p><p>Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur vitae mollis leo. Sed elementum sagittis quam eget euismod. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Maecenas et sapien auctor, scelerisque magna ut, tristique dolor. Curabitur vel dui eros. Cras vitae erat sodales, pulvinar nulla sed, consequat tellus. Sed malesuada, dui in aliquet lobortis, nisl justo placerat nulla, nec maximus magna mi in ex. Phasellus sed dictum magna. Nullam in egestas erat, vitae dapibus velit.</p>",
        "target": "left",
        "position": "right",
        "visibleAtStart": true,
        "visibleForGroups": []
      }
    },
```

## Adding guides, including media assets and styling them

### Styling guide lines and points using the `style` attribute in tables

In order to make the guide features (both lines and points) look differently, depending on guide, there is a `style` column in both database tables. The type of this column is `jsonb`. They can be `NULL`, but it's recommended to set different styling for the features. To do it, the following format is used (make sure to remove the comments!):

```jsonc
// The values below are also the defaults that will be applied if `style` is `NULL` or `{}`
{
  // Both points and lines
  "strokeColor": "orange",
  "strokeWidth": 2

  // Points table only
  "fillColor": "orange",
  "circleRadius": 5,
}
```

### Media assets

This section describes how to add the media assets (images, audio and video files) to the Audioguide App.

As you may have noticed, the database tables include some columns that are meant to be used to link each geometric feature with one-to-many assets. The `audioguide_point` table contains `audios`, `videos` and `images`, while `audioguide_line` table contains `images` only. Each of these columns' values should be _a comma-separated string of either relative or absolute URLs_. `NULL` is an allowed value too.

The linked assets will be shown in the app on a corresponding place in the UI.

#### Recommended structure for relative URLs to media assets

If you wish to use the relative URLs, here's there recommended approach.

The assets must be placed inside the corresponding directory within `public/media/{guideId}/{optional stopNumber if point feature}/{"images"|"audios"|"videos"}/{fileName.extension}`.

E.g. consider the following data in table:

```sql
SELECT "guideId", "stopNumber", images
FROM audioguide_point
ORDER BY "guideId", "stopNumber";

guideId|stopNumber|images           |
-------+----------+-----------------+
      1|         1|1.jpg,2.jpg,3.jpg|
      1|         2|4.jpg            |
      2|         1|1.jpg            |
      2|         2|2.jpg            |
```

Let's look closer at the first two lines of the results above.

The results implies that the app will expect the following files to exist:

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

- The first stop in guide with `guideId` 1 will display three images: `1.jpg,2.jpg,3.jpg`.
- The second stop in guide with `guideId` 1 will display `4.jpg`.
- The first stop in guide with `guideId` 2 will display `1.jpg`.
- The second stop in guide with `guideId` 2 will display `2.jpg`.

## Available options

There are some parameters that can be sent to Hajk that'll affect this plugin's initial settings. Send them using the query string. Here's the list:

- `c`: the _category_ that will be pre-selected.
  - User can pre-select multiple categories, just ensure to send a comma-separated list.
  - You must encode the strings properly. E.g. a category called `Sport & Ö-liv` should become `Sport%20%26%20%C3%96-liv`, while `The Foo/Bar Category` is `The%20Foo%2FBar%20category`.
- `g`: makes it possible to start the app with a certain guide pre-selected. The value of `g` must match the value of `guideId` in the line features table.
- `p`: makes it possible to start the app with a specific point in a guide pre-selected. The value of `p` must correspond to the `stopNumber` value in the point features table. _Note that this requires the `g` parameter to be present too (else there's no way to know which point should be selected, as `stopNumber`s aren't unique in the table)._

## Deploy notes

The app is fully static and can be deployed using any web server. The recommended approach, however, is using Hajk API's static exposer functionality.

Basically, build the app with `npm run build`. This will result in a `www` folder. Rename it to anything you like (e.g. `audioguides`) and put in `{hajkBackend}/static/audioguides`. Next, tell Hajk's API to expose this directory by adding this directive to the `.env`: `EXPOSE_AND_RESTRICT_STATIC_AUDIOGUIDE=`. Refer to Hajk's documentation for further information.

### Vite

There is a [Vite](https://vitejs.dev) bundler setup. It compiles and bundles all "front-end" resources. You should work only with files located in `/src` folder. Vite config located in `vite.config.js`.

### Assets

Assets (icons, splash screens) source images located in `assets-src` folder. To generate your own icons and splash screen images, you will need to replace all assets in this directory with your own images (pay attention to image size and format), and run the following command in the project directory:

```sh
framework7 assets
```

Or launch UI where you will be able to change icons and splash screens:

```sh
framework7 assets --ui
```
