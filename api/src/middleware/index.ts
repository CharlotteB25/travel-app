// middleware/index.ts
import compression from "compression";
import express, { Express } from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors, { CorsOptions } from "cors";
import passport from "../middleware/auth/passport";

const rawAllowed = process.env.CORS_ORIGIN ?? "";
const tokens = rawAllowed
  .split(/[,\s]+/)
  .map((s) => s.trim())
  .filter(Boolean);

const allowAny = tokens.includes("*");
const allowedOrigins = allowAny ? [] : tokens;

// CORS config that safely handles multiple origins + credentials + preflight
const corsOptions: CorsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // server-to-server / same-origin
    if (allowAny) return cb(null, true); // reflect the incoming origin
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
  preflightContinue: false,
};

// middleware/index.ts
export const registerMiddleware = (app: Express) => {
  // Always vary on origin
  app.use((_, res, next) => {
    res.setHeader("Vary", "Origin");
    next();
  });

  // CORS FIRST
  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));

  // Anti-wildcard guard (runs AFTER cors)
  app.use((req, res, next) => {
    const v = res.getHeader("Access-Control-Allow-Origin");
    if (v === "*") {
      const origin = req.headers.origin;
      if (origin) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        // ensure credentials header is present too
        res.setHeader("Access-Control-Allow-Credentials", "true");
      }
    }
    next();
  });

  // Usual middleware
  app.use(express.json());
  app.use(cookieParser());
  app.use(helmet());
  app.use(passport.initialize());
  app.use(compression());
};
