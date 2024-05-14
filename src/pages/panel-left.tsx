import React from "react";
import { useTranslation } from "react-i18next";
import { Block, f7, List, ListItem, Navbar, Page } from "framework7-react";
import { handleShowAllGuides } from "../js/f7Helpers";

function PanelLeft() {
  const { t } = useTranslation("menu");
  return (
    <Page>
      <Navbar title={t("title")} />
      <div
        className="display-flex flex-direction-column justify-content-space-between"
        style={{ height: "100%" }}
      >
        <List dividers insetMd accordionList>
          <ListItem
            title={t("allGuides")}
            panelClose
            link
            noChevron
            onClick={handleShowAllGuides}
          />
          <ListItem link="/share/" title={t("share")} />
          {
            // For iOS and Android, if we're not in Standalone mode yet, let's
            // show a link to the installation instructions page.
            f7.device.standalone === false &&
              (f7.device.ios === true || f7.device.android === true) && (
                <ListItem link="/install/" title={t("install")} />
              )
          }
          <ListItem link="/about/" title={t("about")} />
        </List>
        <Block>
          <img
            src="bottom-ornament.svg"
            className="padding margin"
            alt="Decorative bottom ornament"
          />
        </Block>
      </div>
    </Page>
  );
}

export default PanelLeft;
