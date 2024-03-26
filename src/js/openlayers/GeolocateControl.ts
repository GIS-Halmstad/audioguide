import { Control } from "ol/control";
import Framework7 from "framework7/types";
import {
  enableCompass,
  enableGeolocation,
  // startCompassListener,
} from "./olMap";

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

  // callback(heading: number = 0) {
  //   // Don't rotate if map is animating (e.g. due to an ongoing zoom), as that would
  //   // stop the animation. Also, don't rotate if north is locked.
  //   if (
  //     this.getMap().getView().getAnimating() === true ||
  //     this.f7Instance.store.state.northLock === true
  //   ) {
  //     return;
  //   }

  //   // Convert heading from degrees to radians, negation because otherwise we'll end up
  //   // rotating the background in the wrong direction.
  //   const inRad = -(heading / 180) * Math.PI;

  //   // If Geolocation's heading changes and user didn't lock north up, let's update the View's rotation.
  //   // heading comes in degrees, but we need it in radians
  //   this.getMap().getView().setRotation(inRad);
  // }

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

      // The compass is not part of the Geolocation API, so it's handled
      // separately.
      enableCompass();

      // startCompassListener(this.callback.bind(this));
    } else if (this.f7Instance.store.state.geolocationStatus === "granted") {
      // If geolocation is already enabled, center on user's location.
      this.f7Instance.emit("olCenterOnGeolocation");
    }
  }
}

export default GeolocateControl;
