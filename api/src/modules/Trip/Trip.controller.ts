import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import Trip from "./Trip.model";
import NotFoundError from "../../middleware/error/NotFoundError";

// Get all trips
const getTrips = async (req: Request, res: Response, next: NextFunction) => {
  console.log("🔍 Fetching all trips");
  try {
    const trips = await Trip.find();
    res.json(trips);
  } catch (err) {
    next(err);
  }
};

// Get trip by ID
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

// Create a new trip
const createTrip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trip = new Trip(req.body);
    const result = await trip.save();
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

// Update an existing trip
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

// Delete a trip
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
