import { NextFunction, Request, Response } from "express";
import Trip from "./Trip.model";
import NotFoundError from "../../middleware/error/NotFoundError";
import { AuthRequest } from "../../middleware/auth/authMiddleware";

const getTrips = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthRequest;
    const trips = await Trip.find({
      ownerId: user._id,
    }).sort({ name: 1 });
    res.json(trips);
  } catch (err) {
    next(err);
  }
};

const getTripById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthRequest;
    const { id } = req.params;
    const trip = await Trip.findOne({
      _id: id,
      ownerId: user._id,
    });
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
    const { user } = req as AuthRequest;
    const trip = new Trip({ ...req.body, ownerId: user._id });
    const result = await trip.save();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const updateTrip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthRequest;
    const { id } = req.params;
    const trip = await Trip.findOneAndUpdate(
      {
        _id: id,
        ownerId: user._id,
      },
      req.body,
      { new: true, runValidators: true }
    );
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
    const { user } = req as AuthRequest;
    const { id } = req.params;
    const trip = await Trip.findOneAndDelete({
      _id: id,
      ownerId: user._id,
    });
    if (!trip) {
      throw new NotFoundError("Trip not found");
    }
    res.json({});
  } catch (err) {
    next(err);
  }
};

export { getTrips, createTrip, getTripById, updateTrip, deleteTrip };
