/**
 * @summary Use data in database fields to prepare a list of assets for a given feature.
 * @description Each Feature that comes from DB may have some assets connected to it.
 * The asset may be of the following types: images, audios, videos. To keep it simple
 * for admins, we expect a directory structure in the file system: assets are to be kept
 * in a folder named after the asset type. Each asset type must contains subdirectories,
 * where each subdirectory has a name that corresponds to a given feature's `guideId` value
 * as specified in the database. (All the features in database, lines and points, will always
 * have a `guideId`.)
 * Using those parameters it's easy to covert the comma-separated string of file names into
 * an array of paths for a certain type of assets.
 * Special care must be taken to allow for absolute URLs.
 * @param {Feature} feature The OpenLayers Feature
 * @param {string} type Asset's type.
 * @returns {string[]} URLs to assets.
 */
export const getAssets = (feature, type) => {
  const stopNumber = feature?.get("stopNumber")
    ? `${feature?.get("stopNumber")}/`
    : "";
  return (
    feature
      ?.get(type)
      ?.split(",")
      .map((e) => {
        // Let's check if current string is an absolute URL
        if (e.indexOf("http://") === 0 || e.indexOf("https://") === 0) {
          // Return as is
          return e;
        } else {
          // Prepare a relative URL on the format:
          // /media/{guideId}/{optional stopNumber}/{type of asset}/{asset's file name in DB}
          return `media/${feature.get("guideId")}/${stopNumber}${type}/${e}`;
        }
      }) || []
  );
};
