import React, { useEffect } from "react";

import { App, Card, CardContent, Navbar, Page, View } from "framework7-react";

import store from "../js/store";

const UnsupportedOsApp = () => {
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
          <Navbar title="Halmstad Stories" />
          <Card title="Ditt system stöds inte 😔" outline>
            <CardContent>
              Appen kan tyvärr inte ladda på din enhet eftersom systemkraven
              inte uppnås. Om möjligt, uppgradera till iOS 15 eller senare,
              eller använd en annan enhet. Halmstad Stories fungerar även på
              datorn.
            </CardContent>
          </Card>
        </Page>
      </View>
    </App>
  );
};
export default UnsupportedOsApp;
