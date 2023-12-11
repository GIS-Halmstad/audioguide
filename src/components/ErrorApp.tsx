import React from "react";

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

const ErrorApp = () => {
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
                    </Block>
                    <CardFooter>
                      Detta fel inträffade {new Date().toLocaleTimeString()}
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
