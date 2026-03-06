import type { StoreState } from "./types";

declare module "framework7/components/app/app-class.js" {
  interface Framework7 {
    store: {
      state: StoreState;
      dispatch: (name: string, data?: object) => Promise<unknown>;
      getters: Record<string, unknown>;
    };
  }

  interface Framework7Events {
    olFeatureSelected: (data: { feature: unknown }) => void;
    showFullscreenSwiper: (data: unknown) => void;
    showBackgroundSwitcher: (data: unknown) => void;
    adjustForHeight: (data: unknown) => void;
  }
}
