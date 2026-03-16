import { Control } from "ol/control";
import type { Framework7WithStore } from "../../types/framework7";

interface Options {
  target?: string;
  f7Instance: Framework7WithStore;
}

class BackgroundSwitcherControl extends Control {
  f7Instance: Framework7WithStore;
  constructor(opts: Options) {
    const options = opts || {};

    const button = document.createElement("button");
    button.innerHTML = `<i class="icon f7-icons">layers</i>`;

    const element = document.createElement("div");
    element.className = "ol-background-switcher ol-unselectable ol-control";
    element.appendChild(button);

    super({
      element: element,
      target: options.target,
    });

    this.f7Instance = options.f7Instance;
    button.addEventListener("click", () => this.handleBackgroundSwitch());
  }

  handleBackgroundSwitch() {
    this.f7Instance.emit("showBackgroundSwitcher");
  }
}

export default BackgroundSwitcherControl;
