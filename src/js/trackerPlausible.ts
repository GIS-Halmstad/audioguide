import Plausible from "plausible-tracker";
import { analytics } from "../../public/appConfig.json";

const { domain, apiHost, trackLocalhost } = analytics;

// Exports an instance that implements two necessary methods,
// trackPageview and trackEvent. See store.ts for use.
export const TrackerPlausible = Plausible({
  domain,
  apiHost,
  trackLocalhost,
});
