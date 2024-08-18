import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth/authMiddleware";
import TripModel from "../Trip/Trip.model";

const login = (req: Request, res: Response, next: NextFunction) => {
  const { user } = req as AuthRequest;

  res.json({
    token: user.generateToken(),
  });
};

const getCurrentUser = (req: Request, res: Response, next: NextFunction) => {
  const { user } = req as AuthRequest;
  res.json(user);
};

const getDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = req as AuthRequest;

    // how many trips?
    const trips = await TripModel.countDocuments({ ownerId: user._id });

    res.json({
      trips,
    });
  } catch (e) {
    next(e);
  }
};

export { login, getCurrentUser, getDashboard };
