// network/api.ts
import axios from "axios";

export const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string, // e.g. https://travel-app-wx5p.onrender.com
  headers: { "Content-Type": "application/json" },
});

// Attach Authorization from localStorage (or wherever you store it)
API.interceptors.response.use(
  (res) => res,
  (err) => {
    // helpful debug
    console.error("API error:", {
      url: err?.config?.url,
      status: err?.response?.status,
      data: err?.response?.data,
    });
    return Promise.reject(
      new Error(err?.response?.data?.message || err.message || "Request failed")
    );
  }
);
