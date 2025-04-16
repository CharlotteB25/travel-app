import express, { Express } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { registerMiddleware } from "./middleware";

const app: Express = express();

// ✅ Enable CORS for your frontend
const allowedOrigins = [
  "http://localhost:5173", // Local development
  "https://travel-app-frontend-eta.vercel.app", // Your deployed frontend
];

// Register CORS middleware
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

// Register other middleware
registerMiddleware(app);

// Register routes
registerRoutes(app);

export default app;
