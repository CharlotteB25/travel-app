import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth/authMiddleware";
import TripModel from "../Trip/Trip.model";

const login = (req: Request, res: Response, next: NextFunction) => {
  const { user } = req as AuthRequest;
};

const getCurrentUser = (req: Request, res: Response, next: NextFunction) => {
  const { user } = req as AuthRequest;
  res.json(user);
};

export { login, getCurrentUser };
