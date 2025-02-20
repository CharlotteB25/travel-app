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

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("🔍 Fetching trips for user:", user._id);

    // Fetch only trips that belong to the logged-in user
    const trips = await TripModel.find({ ownerId: user._id });

    res.json({ trips });
  } catch (e) {
    next(e);
  }
};

export { login, getCurrentUser, getDashboard };
