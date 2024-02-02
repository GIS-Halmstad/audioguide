type OriginalConfig = {
  layersConfig: any;
  mapConfig: any;
  userSpecificMaps: any;
};
type NewConfig = {
  projections: any;
  tools: any;
  map: any;
  layersTree: any;
  backgrounds: any;
  ui: any;
};

const extractLayers = (config: any, layers: any[]) => {
  // Prepare a flat array of all layers in the repository. It'll make it easy to
  // find a layer by its ID and extract type (e.g. wmslayer or vectorlayer).
  const flatLayers = Object.entries(config).flatMap((c: [string, any]) => {
    return c[1].map((l: any) => {
      return { type: c[0], ...l };
    });
  });

  // Next, let's loop the provided layers object. It will contains only some
  // basic info (like the ID and `visibleAtStart`), but we need more. So we
  // merge this basic info with everything else we know about the layer (which
  // we just extracted into the `flatLayers` array).
  // In addition to that merge, we want to do this recursively. So if the
  // current layer has layers on its own, let's look them up. Furthermore, if
  // the current layer has a `groups` property, let's check what's inside
  // by invoking this function with the `groups` as an argument.
  return layers.map((l) => {
    return {
      ...flatLayers.find((la) => la.id === l.id), // Spread everything we know, from the big repository.
      ...l, // Expand with some keys that are specific to this map config.
      ...(l.layers && { layers: extractLayers(config, l.layers) }), // Take care of layers inside this (possible) group.
      ...(l.groups && { groups: extractLayers(config, l.groups) }), // Further take care of groups, if there happen to be any.
    };
  });
};

const washMapConfig = (originalConfig: OriginalConfig) => {
  // Helpers
  const extractToolSettings = (tool: string) =>
    originalConfig.mapConfig.tools.find((t: any) => t.type === tool)?.options;

  // Start by grabbing two properties, as-is in the original config. We
  // won't use all settings, but it's a good start anyway.
  const { projections, map, ui = {} } = originalConfig.mapConfig;

  // Next, extract the two tool settings that we do use in this app.
  const tools: any = {
    audioguide: extractToolSettings("audioguide"),
    layercomparer: extractToolSettings("layercomparer"),
  };

  // Next, we want to prepare a new structure for the background and usual
  // layers. This operation will need some work on the original LayerSwitcher's
  // config, so let's store it.
  const layerswitcherConfig = extractToolSettings("layerswitcher");

  // Grab background layers
  const backgrounds = extractLayers(
    originalConfig.layersConfig,
    layerswitcherConfig.baselayers
  );

  // Grab layers tree
  const layersTree = extractLayers(
    originalConfig.layersConfig,
    layerswitcherConfig.groups
  );

  const newConfig: NewConfig = {
    backgrounds,
    layersTree,
    map,
    projections,
    tools,
    ui,
  };
  return newConfig;
};

export default washMapConfig;
