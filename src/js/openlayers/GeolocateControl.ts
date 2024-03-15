import { Control } from "ol/control";
import Framework7 from "framework7/types";
import { enableGeolocation } from "./olMap";

interface Options {
  target?: string;
  f7Instance: Framework7;
}

class GeolocateControl extends Control {
  f7Instance: Framework7;

  constructor(opts: Options) {
    const options = opts || {};

    const button = document.createElement("button");
    button.innerHTML = `<i class="icon material-icons">my_location</i>`;

    const element = document.createElement("div");
    element.className = "ol-geolocate ol-unselectable ol-control";
    element.appendChild(button);

    super({
      element: element,
      target: options.target,
    });

    this.f7Instance = options.f7Instance;
    button.addEventListener("click", () => this.handleClickOnGeolocate());
  }

  handleClickOnGeolocate() {
    if (
      this.f7Instance.store.state.geolocationStatus === "disabled" ||
      this.f7Instance.store.state.geolocationStatus === "denied"
    ) {
      // If geolocation is currently disabled (default on app load), or if
      // user has previously denied geolocation, let's try to enable it again.
      // Successful enabling will also center on user's location, so there's no
      // need to do it explicitly.
      enableGeolocation();
    } else if (this.f7Instance.store.state.geolocationStatus === "granted") {
      // If geolocation is already enabled, center on user's location.
      this.f7Instance.emit("olCenterOnGeolocation");
    }
  }
}

export default GeolocateControl;
