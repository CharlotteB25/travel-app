import compression from "compression";
import express, { Express } from "express";
import helmet from "helmet";
import cors from "cors";

const registerMiddleware = (app: Express) => {
  // CORS configuration: Allow only your frontend to access the backend
  const allowedOrigins = [
    "https://your-frontend-url.onrender.com", // Replace with your actual frontend URL
  ];

  const corsOptions = {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // If you need to send cookies or headers
  };

  app.use(cors(corsOptions));

  // JSON parsing middleware
  app.use(express.json());

  // Helmet for basic security
  app.use(helmet.noSniff());
  app.use(helmet.hidePoweredBy());
  app.use(helmet.xssFilter());

  // Compression for better performance
  app.use(compression());
};

export { registerMiddleware };
