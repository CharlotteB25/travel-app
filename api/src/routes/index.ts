import { Express, Router } from "express";
import tripRoutes from "../modules/Trip/Trip.routes";
import { errorHandler } from "../middleware/error/errorHandlerMiddleware";
import userPublicRoutes from "../modules/User/User.public.routes";
import userPrivateRoutes from "../modules/User/User.private.routes";

import { authJwt } from "../middleware/auth/authMiddleware";

const registerRoutes = (app: Express) => {
  app.use("/", userPublicRoutes);

  const authRoutes = Router();
  authRoutes.use("/", userPrivateRoutes);
  authRoutes.use("/", tripRoutes);

  app.use(authJwt, authRoutes);

  // should be placed AFTER all routes
  app.use(errorHandler);
};

export { registerRoutes };
