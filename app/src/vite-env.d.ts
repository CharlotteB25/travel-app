/// <reference types="vite/trip" />
// env.d.ts or vite-env.d.ts

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_WEATHER_API: string;
  readonly VITE_RAPIDAPI_KEY: string;
  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
