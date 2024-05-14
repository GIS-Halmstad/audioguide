import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { App, Card, CardContent, Navbar, Page, View } from "framework7-react";

import store from "../js/store";

const UnsupportedOsApp = () => {
  const { t } = useTranslation("errorUnsupportedOs");
  useEffect(() => {
    store.dispatch("trackAnalyticsEvent", {
      eventName: "loadError",
      reason: "unsupportedOs",
    });
  }, []);

  return (
    <App name="Audioguide" theme="auto">
      <View main className="safe-areas">
        <Page ptr onPtrRefresh={() => window.location.reload()}>
          <Navbar title={t("appName", { ns: "common" })} />
          <Card title={t("title")} outline>
            <CardContent>{t("message")}</CardContent>
          </Card>
        </Page>
      </View>
    </App>
  );
};
export default UnsupportedOsApp;
