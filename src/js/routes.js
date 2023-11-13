import Home from "../pages/home.jsx";
import About from "../pages/about.jsx";
import Share from "../pages/share.jsx";
import PanelLeft from "../pages/panel-left.jsx";
import PanelRight from "../pages/panel-right.jsx";
import NotFound from "../pages/404.jsx";

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
