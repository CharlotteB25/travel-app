// middleware/index.ts
import compression from "compression";
import express, { Express } from "express";
import helmet from "helmet";
import cors from "cors";
import passport from "../middleware/auth/passport"; // <-- create this file below

export const registerMiddleware = (app: Express) => {
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ?? true,
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    })
  );

  app.use(express.json());
  app.use(helmet()); // replaces xssFilter/noSniff/hidePoweredBy
  app.use(passport.initialize()); // <-- important
  app.use(compression());
};
