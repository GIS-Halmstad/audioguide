import React from "react";

import {
  App,
  View,
  Navbar,
  Page,
  Card,
  CardContent,
  CardFooter,
} from "framework7-react";

const ErrorApp = () => {
  return (
    <App name="Audioguide" theme="auto">
      <View main className="safe-areas">
        <Page ptr onPtrRefresh={() => window.location.reload()}>
          <Navbar title="Audioguide" />
          <Card title="Laddningsfel" outline>
            <CardContent>
              Tyvärr kunde inte appen ladda alla nödvändiga komponenter för att
              starta. Vi ber om ursäkt och hoppas på att få det löst snarast
              möjligt!
            </CardContent>
            <CardContent>
              Du kan även prova att ladda om appen för att se om det hjälper.
            </CardContent>
            <CardFooter>
              Detta fel inträffade {new Date().toLocaleTimeString()}
            </CardFooter>
          </Card>
        </Page>
      </View>
    </App>
  );
};
export default ErrorApp;
