import React from "react";
import { useTranslation } from "react-i18next";
import { Page, Navbar, Block, Button } from "framework7-react";
import { handleCopyLinkToGuide } from "../js/f7Helpers";

const Share = () => {
  const { t } = useTranslation("share");

  return (
    <Page>
      <Navbar
        title={t("title")}
        backLink={t("backLink", { ns: "common" })}
      ></Navbar>
      <Block>
        <p>{t("instructions")}</p>
      </Block>
      <Block>
        <Button fill large onClick={() => handleCopyLinkToGuide()}>
          {t("copyLink", { ns: "common" })}
        </Button>
      </Block>
    </Page>
  );
};

export default Share;
