import { f7 } from "framework7-react";
import type { Framework7WithStore } from "../types/framework7";

// A Proxy that delegates all property access to the live `f7` reference at
// access time rather than import time. This means the typed export is safe
// to import at module-top-level even though Framework7 initialises later.
export const f7Typed: Framework7WithStore = new Proxy(
  {} as Framework7WithStore,
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get(_t, prop, receiver) {
      return Reflect.get(f7 as any, prop, receiver);
    },
  }
);
