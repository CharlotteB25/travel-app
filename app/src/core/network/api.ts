// network/api.ts
import axios from "axios";
import { Router } from "@vaadin/router";

export const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string, // e.g. https://travel-app-wx5p.onrender.com
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Attach Authorization from localStorage (or wherever you store it)
API.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      try {
        Router.go("/login");
      } catch {
        window.location.href = "/login";
      }
    }
    return Promise.reject({
      url: err?.config?.url,
      status,
      data: err?.response?.data,
    });
  }
);
