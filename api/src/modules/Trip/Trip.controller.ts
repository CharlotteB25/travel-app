import { NextFunction, Request, Response } from "express";
import Trip from "./Trip.model";
import NotFoundError from "../../middleware/error/NotFoundError";

const getTrips = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trips = await Trip.find();
    res.json(trips);
  } catch (err) {
    next(err);
  }
};

const getTripById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
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
    res.status(200).json(result);
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
