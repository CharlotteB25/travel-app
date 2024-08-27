import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth/authMiddleware";
import TripModel from "../Trip/Trip.model";
import User from "./User.model";
import bcrypt from "bcrypt";

const login = (req: Request, res: Response, next: NextFunction) => {
  const { user } = req as AuthRequest;

  res.json({
    token: user.generateToken(),
  });
};

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required." });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    // Generate and return a token
    const token = newUser.generateToken();
    res.status(201).json({ token });
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({ message: "Internal Server Error", error });
    next(error);
  }
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

    // Count the number of trips for the user
    const trips = await TripModel.countDocuments({ ownerId: user._id });

    res.json({
      trips,
    });
  } catch (e) {
    console.error("Error fetching dashboard data:", e);
    res.status(500).json({ message: "Internal Server Error" });
    next(e);
  }
};

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthRequest;
    const updateData = req.body;

    // Find the user by ID and update with new data
    const updatedUser = await User.findByIdAndUpdate(user._id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (e) {
    console.error("Error updating user:", e);
    res.status(500).json({ message: "Internal Server Error" });
    next(e);
  }
};

export { login, getCurrentUser, getDashboard, updateUser, register };
