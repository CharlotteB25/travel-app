// middleware/index.ts
import compression from "compression";
import express, { Express } from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import passport from "../middleware/auth/passport";

export const registerMiddleware = (app: Express) => {
  // 0) HARD CORS — FIRST and before anything else
  app.use((req, res, next) => {
    const origin = req.headers.origin as string | undefined;

    // Always vary to avoid cache poisoning
    res.setHeader("Vary", "Origin");

    if (origin) {
      // reflect the exact Origin (never '*') so credentials are allowed
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,PATCH,DELETE,OPTIONS"
      );

      // echo requested headers if provided; otherwise a safe default
      const reqHeaders =
        (req.headers["access-control-request-headers"] as string | undefined) ??
        "Content-Type,Authorization";
      res.setHeader("Access-Control-Allow-Headers", reqHeaders);
    }

    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });

  // 1) the rest
  app.use(express.json());
  app.use(cookieParser());
  app.use(helmet());
  app.use(passport.initialize());
  app.use(compression());
};
