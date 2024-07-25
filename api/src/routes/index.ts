import { Express } from "express";
import tripRoutes from "../modules/Trip/Trip.routes";
import app from "../app";
import { errorHandler } from "../middleware/error/errorHandlerMiddleware";

const registerRoutes = (app: Express) => {
  app.use("/", tripRoutes);

  //Must be placed AFTER all routes
  app.use(errorHandler);
};

export { registerRoutes };
