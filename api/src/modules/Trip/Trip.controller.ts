import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import Trip from "./Trip.model";
import NotFoundError from "../../middleware/error/NotFoundError";

const getTrips = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Assuming req.user contains the authenticated user's ID
    const userId = (req.user as { _id: string })?._id;

    if (!userId) {
      throw new Error("User ID not found");
    }

    // Fetch only the trips that belong to the current user
    const trips = await Trip.find({ userId });

    res.json(trips);
  } catch (err) {
    next(err);
  }
};

const getTripById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundError("Invalid Trip ID");
    }
    const trip = await Trip.findById(id);
    if (!trip) {
      throw new NotFoundError("Trip not found");
    }
    res.json(trip);
  } catch (err) {
    next(err);
  }
};

const createTrip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trip = new Trip(req.body);

    const result = await trip.save();
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

const updateTrip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const trip = await Trip.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!trip) {
      throw new NotFoundError("Trip not found");
    }
    res.json(trip);
  } catch (err) {
    next(err);
  }
};

const deleteTrip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const trip = await Trip.findByIdAndDelete(id);
    if (!trip) {
      throw new NotFoundError("Trip not found");
    }
    res.json({});
  } catch (err) {
    next(err);
  }
};

export { getTrips, createTrip, getTripById, updateTrip, deleteTrip };
