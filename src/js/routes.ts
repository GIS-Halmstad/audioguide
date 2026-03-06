import Home from "../pages/home";
import About from "../pages/about";
import Share from "../pages/share";
import InstallApp from "../pages/install-app";
import PanelLeft from "../pages/panel-left";
import PanelRight from "../pages/panel-right";
import NotFound from "../pages/404";

const routes = [
  {
    path: "/",
    component: Home,
  },
  {
    path: "/about/",
    component: About,
  },
  {
    path: "/share/",
    component: Share,
  },
  {
    path: "/install/",
    component: InstallApp,
  },
  {
    path: "/panel-left/",
    component: PanelLeft,
  },
  {
    path: "/panel-right/",
    component: PanelRight,
  },
  {
    path: "(.*)",
    component: NotFound,
  },
];

export default routes;
