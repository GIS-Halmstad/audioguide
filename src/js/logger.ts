/**
 * This app uses a custom console logging/debugging mechanism.
 * It's super basic: if we're in development mode, or if the query parameter `__debug__` is not empty,
 * the debug mode is considered enabled. In that case calls to log(), warn() and info() are proxied
 * to the console object.
 * Otherwise, the debug mode is considered disabled and no console calls are made.
 */

// Setup the debug mode constant
export const debugEnabled =
  import.meta.env.DEV ||
  new URLSearchParams(window.location.search).get("__debug__") === "";

/**
 * Wraps the console objects and checks if debug mode is enabled before
 * calling the actual console methods.
 *
 * In an initial implementation of this method, I played a bit with also
 * extracting the actual call site from the stack trace. But since the JS
 * engines implement this non-standard functionality a bit differently,
 * there was no way of being sure that the call site would always be correct,
 * so I decided to leave it out.
 *
 * @param {keyof Console} method - The console method to call (warn, info, log).
 * @param {...any[]} args - The arguments to pass to the console method.
 * @return {void} This function does not return a value.
 */
function consoleWrapper(method: "warn" | "info" | "log", ...args: any[]): void {
  debugEnabled && console[method](...args);
}

/**
 * The three methods that follow basically correspond to each of the
 * three console methods that we want to support with this logger.
 */
export function info(...args: any[]) {
  consoleWrapper("info", ...args);
}

export function log(...args: any[]) {
  consoleWrapper("log", ...args);
}

export function warn(...args: any[]) {
  consoleWrapper("warn", ...args);
}
