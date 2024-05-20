import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { Card } from "framework7-react";

const NoGuidesAvailable = () => {
  const { t } = useTranslation("noGuidesAvailable");

  return (
    <Card title={t("title")} content={t("content")} footer={t("footer")} />
  );
};
export default NoGuidesAvailable;
