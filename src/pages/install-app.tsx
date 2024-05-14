import React from "react";
import { Page, Navbar, Block } from "framework7-react";
import { useTranslation } from "react-i18next";

const InstallApp = ({ f7router }) => {
  const { t } = useTranslation("install");
  let instructions = "";

  if (f7router.app.device.ios) {
    instructions = t("instructionsIos");
  } else if (f7router.app.device.android) {
    instructions = t("instructionsAndroid");
  } else {
    instructions = t("instructionsOther");
  }
  return (
    <Page>
      <Navbar
        title={t("title")}
        backLink={t("backLink", { ns: "common" })}
      ></Navbar>
      <Block>
        <p>{t("introMessage")}</p>
        <p>{instructions}</p>
      </Block>
    </Page>
  );
};

export default InstallApp;
