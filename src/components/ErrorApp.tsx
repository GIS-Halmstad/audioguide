import React, { useEffect } from "react";

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
  useEffect(() => {
    console.error(store.state.loadingError);
    store.dispatch("trackAnalyticsEvent", {
      eventName: "loadError",
      reason: store.state.loadingError.message,
    });
  }, []);

  return (
    <App name="Audioguide" theme="auto">
      <View main className="safe-areas">
        <Page ptr onPtrRefresh={() => window.location.reload()}>
          <Navbar title="Audioguide" />
          <Card title="Laddningsfel" outline>
            <CardContent>
              Appen kunde inte ladda alla nödvändiga komponenter. Du kan försöka
              att ladda om genom att svepa uppåt.
            </CardContent>
            <CardContent>
              <List insetMd accordionList>
                <ListItem accordionItem title="Tekniska detaljer">
                  <AccordionContent>
                    <Block>
                      <Button
                        fill
                        className="margin-top margin-bottom"
                        onClick={() => {
                          f7.dialog.prompt(
                            "Ange egen URL till mapservice-tjänsten. Lämna tomt för att använda standardvärde.",
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
                        Ange egen URL till tjänsten
                      </Button>
                      <Button
                        color="red"
                        onClick={() => {
                          localStorage.removeItem("overrideMapServiceBaseUrl");
                          f7.dialog.alert(
                            "URL:en har återställs till standardvärde. Appen kommer nu att ladda om.",
                            () => {
                              window.location.reload();
                            }
                          );
                        }}
                      >
                        Nollställ egen URL till tjänsten
                      </Button>
                    </Block>
                    <CardFooter
                      className="display-block"
                      style={{ fontFamily: "monospace" }}
                    >
                      <hr />
                      <p>{store.state.loadingError.toString()}</p>
                      <p>Error timestamp: {new Date().toLocaleTimeString()}</p>
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
