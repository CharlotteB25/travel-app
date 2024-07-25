import "./style/reset.css";
import "./style/main.css";

import { router } from "@core/router";

import "@components/app/App";

const routes = [
  {
    path: "/",
    component: "my-app",
    children: [
      {
        path: "trips",
        component: "trip-overview",
        action: async () => {
          await import("@components/trips/TripOverview");
        },
      },
      {
        path: "trips/:id",
        component: "trip-detail",
        action: async () => {
          await import("@components/trips/TripDetail");
        },
      },
    ],
  },
];

router.setRoutes(routes);
