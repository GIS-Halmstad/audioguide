import React, { useEffect, useState } from "react";
import { f7, useStore } from "framework7-react";

/**
 * Generates the title for the Navbar based on the active guide and stop number.
 *
 * @return {JSX.Element} The title for the Navbar.
 */
function NavbarTitle() {
  // State variable for changing title in the Navbar
  const defaultTitle = f7.store.state.mapConfig.ui?.name || "Audioguide";
  const [navbarTitle, setNavbarTitle] = useState(defaultTitle);

  // Needed to determine an accurate title for the navbar.
  const activeGuideObject = useStore("activeGuideObject");
  const activeStopNumber = useStore("activeStopNumber");

  // Listen for changes to the active guide and stop number and set
  // the title in the navbar accordingly.
  useEffect(() => {
    if (activeGuideObject && activeStopNumber) {
      setNavbarTitle(
        `${activeGuideObject.line.get("title")} - ${activeStopNumber} av ${
          Object.entries(activeGuideObject.points).length
        }`
      );
    } else {
      setNavbarTitle(defaultTitle);
    }
  }, [activeGuideObject, activeStopNumber, defaultTitle]);
  return <>{navbarTitle}</>;
}

export default NavbarTitle;
