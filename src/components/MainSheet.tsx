import React, { useEffect } from "react";

import {
  f7,
  Block,
  Link,
  Sheet,
  Toolbar,
  useStore,
  Button,
} from "framework7-react";

import { deactivateGuide } from "../js/olMap";

function MainSheet() {
  f7.sheet.open(".main-sheet");

  return (
    <Sheet
      className="main-sheet"
      style={{ height: "auto", maxHeight: "70vh", minHeight: "5vh" }}
      swipeToStep
    >
      <div
        className="swipe-handler"
        onClick={() => f7.sheet.stepToggle(".main-sheet")}
      ></div>
      <div className="sheet-modal-swipe-step">
        <div className="display-flex padding justify-content-space-between align-items-center">
          <h2>Audioguide</h2>
        </div>
      </div>
      <div
        className="page-content"
        style={{
          maxHeight: "80vh",
        }}
      >
        <div className="padding-horizontal padding-bottom">
          <Button fill>Lista guider</Button>
        </div>
        <Block>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas
          vitae mi vitae purus congue convallis. Curabitur condimentum dolor sed
          erat rhoncus mollis. Mauris sed massa vehicula, bibendum diam sit
          amet, semper massa. Praesent cursus rhoncus mattis. Sed sed laoreet
          lectus, ac aliquet ipsum. Quisque vel risus ante. Phasellus vel mauris
          mauris. Nunc rhoncus mi enim, vitae facilisis magna imperdiet nec.
          Maecenas nec quam ipsum. Vestibulum bibendum interdum elit vel
          laoreet. Nulla facilisi. Fusce efficitur nisi non tristique pulvinar.
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas
          vitae mi vitae purus congue convallis. Curabitur condimentum dolor sed
          erat rhoncus mollis. Mauris sed massa vehicula, bibendum diam sit
          amet, semper massa. Praesent cursus rhoncus mattis. Sed sed laoreet
          lectus, ac aliquet ipsum. Quisque vel risus ante. Phasellus vel mauris
          mauris. Nunc rhoncus mi enim, vitae facilisis magna imperdiet nec.
          Maecenas nec quam ipsum. Vestibulum bibendum interdum elit vel
          laoreet. Nulla facilisi. Fusce efficitur nisi non tristique pulvinar.
        </Block>
      </div>
    </Sheet>
  );
}

export default MainSheet;
