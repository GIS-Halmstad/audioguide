import React from "react";
import { useTranslation } from "react-i18next";

import { Block, BlockTitle, Sheet, useStore } from "framework7-react";

function DemoMessageSheet() {
  const { t } = useTranslation("demo");
  const loading = useStore("loading");
  return (
    <Sheet
      opened={loading === false}
      className="demo-sheet-swipe-to-close"
      style={{ height: "auto" }}
      swipeToClose
      push
      backdrop
    >
      <div className="swipe-handler"></div>
      <div>
        <BlockTitle>{t("title")}</BlockTitle>
        <Block>{t("message1")}</Block>
        <Block>{t("message2")}</Block>
        <Block>{t("message3")}</Block>
      </div>
    </Sheet>
  );
}

export default DemoMessageSheet;
