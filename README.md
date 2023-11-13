# AudioGuide - Dev notes

## Startup control

The following hash parameters (URL parameters provided after the # sign) are allowed:

- `c` - Categories that will be enabled on app start. Comma-separated list. If none are provided, or the list is empty, all categories will be selected by default.
- `g` - Unique Guide ID. App will start zoomed into this guide. No other guides will be visible and the categories filter will not be reachable at this point.
- `p` - unique point ID

## Vite

There is a [Vite](https://vitejs.dev) bundler setup. It compiles and bundles all "front-end" resources. You should work only with files located in `/src` folder. Vite config located in `vite.config.js`.

## Assets

Assets (icons, splash screens) source images located in `assets-src` folder. To generate your own icons and splash screen images, you will need to replace all assets in this directory with your own images (pay attention to image size and format), and run the following command in the project directory:

```
framework7 assets
```

Or launch UI where you will be able to change icons and splash screens:

```
framework7 assets --ui
```
