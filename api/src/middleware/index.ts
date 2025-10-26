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

export const registerMiddleware = (app: Express) => {
  app.use((req, res, next) => {
    res.setHeader("Vary", "Origin");
    next();
  });
  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));

  // 3) Usual middleware
  app.use(express.json());
  app.use(cookieParser());
  app.use(helmet());
  app.use(passport.initialize());
  app.use(compression());
};
