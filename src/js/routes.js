import Home from "../pages/home.jsx";
import About from "../pages/about.jsx";

import NotFound from "../pages/404.jsx";

const routes = [
  {
    path: "/",
    component: Home,
  },
  {
    path: "/about",
    component: About,
  },
  {
    path: "(.*)",
    component: NotFound,
  },
];

export default routes;
