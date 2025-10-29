// routes/index.ts
import { Express, Router } from "express";
import tripRoutes from "../modules/Trip/Trip.routes";
import { errorHandler } from "../middleware/error/errorHandlerMiddleware";
import userPublicRoutes from "../modules/User/User.public.routes";
import userPrivateRoutes from "../modules/User/User.private.routes";
import { authJwt } from "../middleware/auth/authMiddleware";

const registerRoutes = (app: Express) => {
  const api = Router();

  // public API (e.g. POST /api/login, POST /api/register)
  api.use("/", userPublicRoutes);

  // private API (JWT)
  const authRoutes = Router();
  authRoutes.use("/", userPrivateRoutes);
  authRoutes.use("/", tripRoutes);
  api.use(authJwt, authRoutes);

  // API-only error handler and 404
  api.use(errorHandler);
  api.use((_, res) => res.status(404).json({ message: "API route not found" }));

  app.use("/api", api);
};

export { registerRoutes };
