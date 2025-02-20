import "./components/style/reset.css";
import "./components/style/main.css";

import { router } from "@core/router";

import "@components/app/App";

// Function to check if the user is authenticated
const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("authToken");
  return !!token; // returns true if token exists, false if not
};

// Define the routes for your app
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
              // Check if the user is authenticated before showing trips page
              if (!isAuthenticated()) {
                // Redirect to login page if not authenticated
                window.location.href = "/login";
                return;
              }
              await import("@components/pages/trips/TripOverview");
            },
          },
          {
            path: "trips/create",
            component: "trip-create",
            action: async () => {
              // Ensure the user is authenticated before accessing trip creation page
              if (!isAuthenticated()) {
                window.location.href = "/login";
                return;
              }
              await import("@components/pages/trips/TripCreate");
            },
          },
          {
            path: "trips/:id",
            component: "trip-detail-container",
            action: async () => {
              // Check for authentication before accessing trip detail
              if (!isAuthenticated()) {
                window.location.href = "/login";
                return;
              }
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
        path: "login",
        component: "login-page",
        action: async () => {
          // Check if the user is already logged in, and if so, redirect to trips page
          if (isAuthenticated()) {
            window.location.href = "/trips";
            return;
          }
          await import("@components/auth/Login");
        },
      },
    ],
  },
];

// Register routes with the router
router.setRoutes(routes);
