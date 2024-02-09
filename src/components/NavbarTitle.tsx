import React from "react";
import { f7 } from "framework7-react";

/**
 * Generates the title for the Navbar based on the active guide and stop number.
 *
 * @return {JSX.Element} The title for the Navbar.
 */
function NavbarTitle() {
  // State variable for changing title in the Navbar
  const navbarTitle = f7.store.state.mapConfig.ui?.name || "Audioguide";

  return <>{navbarTitle}</>;
}

export default NavbarTitle;
