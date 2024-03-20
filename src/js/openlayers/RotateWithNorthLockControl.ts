import { Rotate } from "ol/control";
import Framework7 from "framework7/types";

interface Options {
  autoHide?: boolean;
  label: string;
  f7Instance: Framework7;
}

class RotateWithNorthLockControl extends Rotate {
  f7Instance: Framework7;
  constructor(opts: Options) {
    const options = opts || {};
    super(options);
    this.f7Instance = options.f7Instance;
  }

  handleClick_(e: MouseEvent) {
    // Do exactly the same as ol.control.Rotate would do.
    super.handleClick_(e);

    // Extend it with this lock mechanism that utilizes our Store.
    const northLock = this.f7Instance.store.state.northLock;
    this.f7Instance.store.dispatch("setNorthLock", !northLock);
  }
}

export default RotateWithNorthLockControl;
