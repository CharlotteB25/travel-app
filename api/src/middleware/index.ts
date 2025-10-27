// middleware/index.ts
import compression from "compression";
import express, { Express } from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import passport from "../middleware/auth/passport";

export const registerMiddleware = (app: Express) => {
  // --- HARD CORS (FIRST) ---
  app.use((req, res, next) => {
    const origin = req.headers.origin as string | undefined;

    // Always vary on Origin to avoid cache poisoning
    res.setHeader("Vary", "Origin");

    if (origin) {
      // Reflect the exact origin (never '*') so credentials are allowed
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,PATCH,DELETE,OPTIONS"
      );

      // Echo the headers the browser says it will send (authorization, content-type, etc.)
      const reqHeaders =
        (req.headers["access-control-request-headers"] as string | undefined) ??
        "Content-Type,Authorization";
      res.setHeader("Access-Control-Allow-Headers", reqHeaders);
    }

    // Short-circuit preflight so no proxy can add '*'
    if (req.method === "OPTIONS") return res.sendStatus(204);

    next();
  });

  // --- the rest ---
  app.use(express.json());
  app.use(cookieParser());
  app.use(helmet());
  app.use(passport.initialize());
  app.use(compression());
};
