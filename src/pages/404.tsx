import React from "react";
import { useTranslation } from "react-i18next";
import { Page, Navbar, Block } from "framework7-react";

const NotFound = () => {
  const { t } = useTranslation("error404");

  return (
    <Page>
      <Navbar
        title={t("title")}
        backLink={t("backLink", { ns: "common" })}
      ></Navbar>
      <Block>
        <p>{t("oops")}</p>
        <p>{t("message")}</p>
      </Block>
    </Page>
  );
};

export default NotFound;
