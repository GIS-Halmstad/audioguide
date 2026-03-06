type Projection = {
  code: string;
  definition: string;
  extent: number[];
  unit: null;
};

type LayerEntry = Record<string, unknown> & {
  id?: string;
  layers?: LayerEntry[];
  groups?: LayerEntry[];
};

type LayerswitcherOptions = {
  baselayers?: LayerEntry[];
  groups?: LayerEntry[];
};

type MapConfigShape = {
  projections?: Projection[];
  map?: Record<string, unknown>;
  tools?: Array<{ type?: string; options?: unknown }>;
  ui?: Record<string, unknown>;
};

type OriginalConfig = {
  layersConfig: Record<string, unknown[]>;
  mapConfig: MapConfigShape;
  userSpecificMaps: Record<string, unknown>;
};
type NewConfig = {
  projections: Projection[];
  tools: Record<string, unknown>;
  map: Record<string, unknown>;
  layersTree: LayerEntry[];
  backgrounds: LayerEntry[];
  ui: Record<string, unknown>;
};

const extractLayers = (
  config: Record<string, unknown[]>,
  layers: LayerEntry[]
): LayerEntry[] => {
  // Prepare a flat array of all layers in the repository. It'll make it easy to
  // find a layer by its ID and extract type (e.g. wmslayer or vectorlayer).
  const flatLayers: LayerEntry[] = Object.entries(config).flatMap(
    (c: [string, unknown[]]) => {
      return c[1].map((l: Record<string, unknown>) => ({
        type: c[0],
        ...l,
      })) as LayerEntry[];
    }
  );

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
    (originalConfig.mapConfig.tools ?? []).find((t) => t.type === tool)
      ?.options;

  // Start by grabbing two properties, as-is in the original config. We
  // won't use all settings, but it's a good start anyway.
  const { projections = [], map = {}, ui = {} } = originalConfig.mapConfig;

  // Next, extract the tools that we do use in this app.
  const tools: Record<string, unknown> = {
    audioguide: extractToolSettings("audioguide"),
  };

  // Next, we want to prepare a new structure for the background and usual
  // layers. This operation will need some work on the original LayerSwitcher's
  // config, so let's store it.
  const layerswitcherConfig = (extractToolSettings("layerswitcher") ??
    {}) as LayerswitcherOptions;

  // Grab background layers, unless map config says we only use OSM
  const backgrounds =
    (map as Record<string, unknown>).osmBackgroundOnly !== true
      ? extractLayers(
          originalConfig.layersConfig,
          layerswitcherConfig.baselayers ?? []
        )
      : [];

  // Grab layers tree
  const layersTree = extractLayers(
    originalConfig.layersConfig,
    layerswitcherConfig.groups ?? []
  );

  const newConfig: NewConfig = {
    backgrounds,
    layersTree,
    map: map as Record<string, unknown>,
    projections: projections as Projection[],
    tools,
    ui: ui as Record<string, unknown>,
  };
  return newConfig;
};

export default washMapConfig;
