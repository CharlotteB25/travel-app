import "./components/style/reset.css";
import "./components/style/main.css";

import { router } from "@core/router";

import "@components/app/App";

const routes = [
  {
    path: "/",
    component: "my-app",
    children: [
      {
        path: "/",
        component: "auth-container",
        action: async () => {
          await import("@components/auth/AuthContainer");
        },
        children: [
          {
            path: "/",
            component: "app-home",
            action: async () => {
              await import("@components/pages/home/home");
            },
          },
          {
            path: "settings",
            component: "settings-page",
            action: async () => {
              await import("@components/pages/settings/settings");
            },
          },
          {
            path: "trips",
            component: "trip-overview",
            action: async () => {
              await import("@components/pages/trips/TripOverview");
            },
          },
          {
            path: "trips/create",
            component: "trip-create",
            action: async () => {
              await import("@components/pages/trips/TripCreate");
            },
          },
          {
            path: "trips/:id",
            component: "trip-detail-container",
            action: async () => {
              await import("@components/pages/trips/TripDetailContainer");
            },
            children: [
              {
                path: "/",
                component: "trip-detail",
                action: async () => {
                  await import("@components/pages/trips/TripDetail");
                },
              },
              {
                path: "/edit",
                component: "trip-edit",
                action: async () => {
                  await import("@components/pages/trips/TripEdit");
                },
              },
            ],
          },
        ],
      },
      {
        path: "register",
        component: "register-page",
        action: async () => {
          await import("@components/auth/Register");
        },
      },
      {
        path: "login",
        component: "login-page",
        action: async () => {
          await import("@components/auth/Login");
        },
      },
    ],
  },
];

router.setRoutes(routes);
