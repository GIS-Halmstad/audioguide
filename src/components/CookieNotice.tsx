import React from "react";
import { useTranslation } from "react-i18next";

import {
  Block,
  BlockTitle,
  Button,
  Link,
  NavRight,
  NavTitle,
  Navbar,
  Page,
  Popup,
  Sheet,
  f7,
} from "framework7-react";
import { pseudoSanitize } from "../js/utils";

function CookieNotice() {
  const { t } = useTranslation("cookies");

  const allowEssential = () => {
    localStorage.setItem("cookieSelection", "0");
    f7.sheet.close(".cookie-notice");
  };

  const allowFunctional = () => {
    localStorage.setItem("cookieSelection", "1");
    f7.sheet.close(".cookie-notice");
  };

  return (
    <>
      <Popup
        className="integrity-policy safe-areas"
        style={{
          zIndex: "13000",
          borderColor: "var(--on-theme-color)",
          borderStyle: "solid",
        }}
      >
        <Page>
          <Navbar>
            <NavTitle>
              <Link className="app-logo no-padding">
                <img src="navbar-logo.svg" />
              </Link>
            </NavTitle>
            <NavRight>
              <Link popupClose>{t("close", { ns: "common" })}</Link>
            </NavRight>
          </Navbar>

          <div
            className="margin"
            dangerouslySetInnerHTML={{
              __html: pseudoSanitize(
                t("messageHtml", { ns: "integrityPolicy" })
              ),
            }}
          ></div>
        </Page>
      </Popup>
      <Sheet
        style={{
          height: "auto",
          zIndex: "12501",
          borderColor: "var(--on-theme-color)",
          borderStyle: "solid",
          borderBottom: "none",
        }}
        className="cookie-notice"
        backdrop
      >
        <BlockTitle>{t("title")}</BlockTitle>
        <Block>
          <div
            dangerouslySetInnerHTML={{
              __html: pseudoSanitize(t("messageHtml")),
            }}
          />
          <Button popupOpen=".integrity-policy" small>
            {t("showCompletePrivacyPolicy")}
          </Button>
        </Block>
        <Block>
          <Button large fill onClick={allowFunctional}>
            {t("allowFunctional")}
          </Button>
          <Button
            small
            color="red"
            onClick={allowEssential}
            className="margin-top margin-bottom"
          >
            {t("allowEssential")}
          </Button>
        </Block>
      </Sheet>
    </>
  );
}

export default CookieNotice;
