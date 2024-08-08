import { NextFunction, Response, Request } from "express";
import NotFoundError from "../../middleware/error/NotFoundError";
import { AuthRequest } from "../../middleware/auth/authMiddleware";
import LogModel from "./Log.model";
import TripModel from "../Trip/Trip.model";

const getLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthRequest;
    const { date, tripId } = req.query;

    const log = await LogModel.find({
      ownerId: user._id,
      ...(date ? { date: date } : {}),
      ...(tripId ? { tripId: tripId } : {}),
    })
      .sort({ date: 1 })
      .lean()
      .populate("trip", ["title", "_id"]);
    res.json(log);
  } catch (e) {
    next(e);
  }
};

const getLogsByTrip = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const tripId = req.params.id;
  req.query.tripId = tripId;
  return await getLogs(req, res, next);
};

const getLogDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = req as AuthRequest;
    const { id } = req.params;
    const log = await LogModel.findOne({
      _id: id,
      ownerId: user._id,
    })
      .lean()
      .populate("trip");
    if (!log) {
      throw new NotFoundError("Log not found");
    }
    res.json(log);
  } catch (e) {
    next(e);
  }
};

const createLog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthRequest;

    // make sure project exists AND that the project belongs to the user
    const trip = await TripModel.findOne({
      _id: req.body.projectId,
      ownerId: user._id,
    });

    if (!trip) {
      throw new NotFoundError("Trip not found");
    }

    const log = new LogModel({
      ...req.body,
      ownerId: user._id,
    });
    const result = await log.save();
    res.json(result);
  } catch (e) {
    next(e);
  }
};

const updateLog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthRequest;
    const { id } = req.params;

    // make sure project exists AND that the project belongs to the user
    if (req.body.tripId) {
      const trip = await TripModel.findOne({
        _id: req.body.tripId,
        ownerId: user._id,
      });

      if (!trip) {
        throw new NotFoundError("trip not found");
      }
    }

    // { new: true } om ge-update versie terug te krijgen
    const log = await LogModel.findOneAndUpdate(
      {
        _id: id,
        ownerId: user._id,
      },
      req.body,
      { new: true, runValidators: true }
    );
    if (!log) {
      throw new NotFoundError("Log not found");
    }
    res.json(log);
  } catch (e) {
    next(e);
  }
};

const deleteLog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthRequest;
    const { id } = req.params;
    const log = await LogModel.findOneAndDelete({
      _id: id,
      ownerId: user._id,
    });
    if (!log) {
      throw new NotFoundError("Log not found");
    }
    res.json({});
  } catch (e) {
    next(e);
  }
};

export {
  getLogs,
  getLogDetail,
  createLog,
  updateLog,
  deleteLog,
  getLogsByTrip,
};
