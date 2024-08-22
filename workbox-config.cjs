module.exports = {
  globDirectory: "www/",
  globPatterns: [
    "**/*.{json,svg,webmanifest,woff2,woff,js,css,webp,png,html,geojson,mp3,jpg,mp4}",
  ],
  swDest: "www/service-worker.js",
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
};
