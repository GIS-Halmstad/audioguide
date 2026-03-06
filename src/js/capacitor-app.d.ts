import type Framework7 from "framework7/types";

declare const capacitorApp: {
  f7: Framework7 | null;
  handleSplashscreen: () => void;
  handleAndroidBackButton: () => void;
  handleKeyboard: () => void;
  init: (f7: Framework7) => void;
};

export default capacitorApp;
