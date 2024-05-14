import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import {
  f7,
  AccordionContent,
  App,
  Block,
  Button,
  Card,
  CardContent,
  CardFooter,
  List,
  ListItem,
  Navbar,
  Page,
  View,
} from "framework7-react";

import store from "../js/store";

const ErrorApp = () => {
  const { t } = useTranslation(["loadError", "common"]);
  useEffect(() => {
    console.error(store.state.loadingError);
    store.dispatch("trackAnalyticsEvent", {
      eventName: "loadError",
      reason: store.state.loadingError.message,
    });
  }, []);

  return (
    <App name={t("appName", { ns: "common" })} theme="auto">
      <View main className="safe-areas">
        <Page ptr onPtrRefresh={() => window.location.reload()}>
          <Navbar title={t("appName", { ns: "common" })} />
          <Card title={t("title")} outline>
            <CardContent>{t("message")}</CardContent>
            <CardContent>
              <List insetMd accordionList>
                <ListItem accordionItem title={t("showTechnicalDetails")}>
                  <AccordionContent>
                    <Block>
                      <Button
                        fill
                        className="margin-top margin-bottom"
                        onClick={() => {
                          f7.dialog.prompt(
                            t("overrideMapServiceBaseUrlPrompt"),
                            (url) => {
                              localStorage.setItem(
                                "overrideMapServiceBaseUrl",
                                url
                              );
                              window.location.reload();
                            }
                          );
                        }}
                      >
                        {t("overrideMapServiceBaseUrlButton")}
                      </Button>
                      <Button
                        color="red"
                        onClick={() => {
                          localStorage.removeItem("overrideMapServiceBaseUrl");
                          f7.dialog.alert(
                            t("resetMapServiceBaseUrlPrompt"),
                            () => {
                              window.location.reload();
                            }
                          );
                        }}
                      >
                        {t("resetMapServiceBaseUrlButton")}
                      </Button>
                    </Block>
                    <CardFooter
                      className="display-block"
                      style={{ fontFamily: "monospace" }}
                    >
                      <hr />
                      <p>{store.state.loadingError.toString()}</p>
                      <p>{new Date().toLocaleTimeString()}</p>
                    </CardFooter>
                  </AccordionContent>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Page>
      </View>
    </App>
  );
};
export default ErrorApp;
