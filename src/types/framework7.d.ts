import type Framework7 from "framework7/types";
import type { StoreState } from "./types";

export type Framework7WithStore = Framework7 & {
  store: {
    state: StoreState;
    dispatch: (name: string, data?: object) => Promise<unknown>;
    getters: Record<string, unknown>;
  };
  emit(event: string, ...args: unknown[]): void;
  on(event: string, handler: (...args: unknown[]) => void): void;
  off(event: string, handler?: (...args: unknown[]) => void): void;
};
