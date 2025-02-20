import { Express, Router } from "express";
import tripRoutes from "../modules/Trip/Trip.routes";
import { errorHandler } from "../middleware/error/errorHandlerMiddleware";
import userPublicRoutes from "../modules/User/User.public.routes";
import userPrivateRoutes from "../modules/User/User.private.routes";
import { authJwt } from "../middleware/auth/authMiddleware";

const registerRoutes = (app: Express) => {
  // Public routes (e.g., for signup, login)
  app.use("/", userPublicRoutes); // These should not require auth middleware

  // Authenticated routes (e.g., for user profile, trips)
  const authRoutes = Router();
  authRoutes.use("/", userPrivateRoutes); // Private routes that require auth
  authRoutes.use("/", tripRoutes); // Trip routes that require auth

  // Use JWT authentication middleware ONLY for the private routes
  app.use(authJwt, authRoutes);

  // Error handler middleware should be placed last
  app.use(errorHandler);
};

export { registerRoutes };
