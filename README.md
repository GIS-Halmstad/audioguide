# The AudioGuide App

TBA

## Requirements

### The database

Create these two tables in your spatial database:

#### audioguide_line

```sql
-- Table: public.audioguide_line

-- DROP TABLE IF EXISTS public.audioguide_line;

CREATE TABLE IF NOT EXISTS public.audioguide_line
(
    id integer PRIMARY KEY NOT NULL GENERATED ALWAYS AS IDENTITY ,
    "guideId" smallint NOT NULL,
    title text COLLATE pg_catalog."default" NOT NULL,
    text text COLLATE pg_catalog."default" NOT NULL,
    categories text COLLATE pg_catalog."default",
    images text COLLATE pg_catalog."default",
    length text COLLATE pg_catalog."default" NOT NULL DEFAULT 0,
    "style" jsonb NULL,
    geom geometry(LineString,3008) NOT NULL,
    CONSTRAINT audioguide_line_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.audioguide_line
    OWNER to geoserver;
-- Index: sidx_audioguide_line_geom

-- DROP INDEX IF EXISTS public.sidx_audioguide_line_geom;

CREATE INDEX IF NOT EXISTS sidx_audioguide_line_geom
    ON public.audioguide_line USING gist
    (geom)
    TABLESPACE pg_default;
```

#### audioguide_point

```sql
-- Table: public.audioguide_point

-- DROP TABLE IF EXISTS public.audioguide_point;

CREATE TABLE IF NOT EXISTS public.audioguide_point
(
    id integer PRIMARY KEY NOT NULL GENERATED ALWAYS AS IDENTITY,
    "guideId" smallint NOT NULL,
    "stopNumber" smallint NOT NULL,
    title text COLLATE pg_catalog."default" NOT NULL,
    text text COLLATE pg_catalog."default" NOT NULL,
    images text COLLATE pg_catalog."default",
    audios text COLLATE pg_catalog."default",
    videos text COLLATE pg_catalog."default",
    "style" jsonb NULL,
    geom geometry(Point,3008) NOT NULL,
    CONSTRAINT audioguide_point_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.audioguide_point
    OWNER to geoserver;
-- Index: sidx_audioguide_point_geom

-- DROP INDEX IF EXISTS public.sidx_audioguide_point_geom;

CREATE INDEX IF NOT EXISTS sidx_audioguide_point_geom
    ON public.audioguide_point USING gist
    (geom)
    TABLESPACE pg_default;
```

### The OGC WFS Service

Publish the tables described above using a WFS service can output features as `application/json`.

Ensure to note the _workspace_, workspace's _namespace_, layers' _SRS_ as well the _URL_ to the WFS service.

### The Hajk API

This app is made to work out-of-the-box with Hajk's API. This means that you should have a recent version of the Hajk API running, as you will need to add some settings to a map config file in order to configure this app.

## Example configuration

In order to tell the AudioGuide app where to find the required Hajk API, you must add the following to `public/appConfig.json`:

```jsonc
{
  "mapServiceBase": "http://localhost:3002/api/v2", // URL to the Hajk API
  "mapName": "demo" // Name of the map that contains the AudioGuide tool options (see below)
}
```

In addition, you must add the AudioGuide tool options to the map config that you specified in `appConfig.json`. Here's an example configuration:

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

This section describes how to add the media assets (images, audio and video files) to the AudioGuide App.

As you may have noticed, the database tables include some columns that are meant to be used to link each geometric feature with one-to-many assets. The `audioguide_point` table contains `audios`, `videos` and `images`, while `audioguide_line` table contains `images` only. Each of these columns' values should be _a comma-separated string of either relative or absolute URLs_. `NULL` is an allowed value too.

The linked assets will be shown in the app on a corresponding place in the UI.

#### Recommended structure for relative URLs to media assets

If you wish to use the relative URLs, here's there recommended approach.

The assets must be placed inside the corresponding directory within `public/`, e.g. `public/audios` or `public/images`. _Furthermore, each asset type directory must contain directories whose names correspond to the value of `guideId`._

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
public/images
├── 1           <-- dir name corresponds to `guideId`
│   ├── 1.jpg
│   ├── 2.jpg
│   ├── 3.jpg
│   └── 4.jpg
├── 2           <-- dir name corresponds to `guideId`
│   ├── 1.jpg
│   └── 2.jpg
```

And the result of the configuration above is that:

- The first stop in guide with `guideId` 1 will display three images: `1.jpg,2.jpg,3.jpg`.
- The second stop in guide with `guideId` 1 will display `4.jpg`.
- The first stop in guide with `guideId` 2 will display `1.jpg`.
- The second stop in guide with `guideId` 2 will display `2.jpg`.

And all the files needed do exist in their respective directory, as we can see in the directory listing of `public/images`.

## Available options

There are some parameters that can be sent to Hajk that'll affect this plugin's initial settings. Send them using the query string. Here's the list:

- `c`: the _category_ that will be pre-selected.
  - User can pre-select multiple categories, just ensure to send a comma-separated list.
  - You must encode the strings properly. E.g. a category called `Sport & Ö-liv` should become `Sport%20%26%20%C3%96-liv`, while `The Foo/Bar Category` is `The%20Foo%2FBar%20category`.

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
