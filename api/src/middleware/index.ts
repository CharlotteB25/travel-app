import compression from "compression";
import express, { Express } from "express";
import helmet from "helmet";
import cors from "cors";

const registerMiddleware = (app: Express) => {
  // ✅ Define your allowed origins for CORS
  const allowedOrigins = [
    "http://localhost:5173", // Local development
    "https://travel-app-1-bzyp.onrender.com", // Your deployed frontend
  ];

  // ✅ CORS middleware - define allowed origins before other middleware
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true, // Allow cookies/auth headers if needed
    })
  );

  // Other middleware
  app.use(express.json()); // JSON parsing
  app.use(helmet.noSniff()); // Helmet headers
  app.use(helmet.hidePoweredBy());
  app.use(helmet.xssFilter());

  app.use(compression()); // Compress responses
};

export { registerMiddleware };
