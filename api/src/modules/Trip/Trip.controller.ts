// Trip.controller.ts
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import Trip from "./Trip.model";
import NotFoundError from "../../middleware/error/NotFoundError";

const getTrips = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as { _id: string })?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const trips = await Trip.find({ userId }).sort({ startDate: 1 });
    res.json(trips);
  } catch (err) {
    next(err);
  }
};

const getTripById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new NotFoundError("Invalid Trip ID");

    const userId = (req.user as { _id: string })?._id;
    const trip = await Trip.findOne({ _id: id, userId });
    if (!trip) throw new NotFoundError("Trip not found");

    res.json(trip);
  } catch (err) {
    next(err);
  }
};

const createTrip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("AUTH HEADER:", req.headers.authorization || "(none)");
    console.log("REQUEST BODY:", JSON.stringify(req.body, null, 2));

    const userId = (req.user as { _id: string })?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const b = req.body ?? {};

    const missing: string[] = [];
    if (!b.title) missing.push("title");
    if (!b.location) missing.push("location");
    if (!b.startDate) missing.push("startDate");
    if (!b.endDate) missing.push("endDate");
    if (missing.length) {
      return res.status(400).json({
        message: `Missing required fields: ${missing.join(", ")}`,
        bodyKeys: Object.keys(b), // <- helpful to see what actually arrived
      });
    }

    const start = new Date(b.startDate);
    const end = new Date(b.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }
    if (end < start) {
      return res
        .status(400)
        .json({ message: "End date must be after start date" });
    }

    const activities = Array.isArray(b.activities)
      ? b.activities
          .filter((a: any) => a && String(a.title ?? "").trim() !== "")
          .map((a: any) => ({
            title: String(a.title).trim(),
            date: a.date ? String(a.date) : undefined,
            time: a.time ? String(a.time) : undefined,
            location: a.location ? String(a.location).trim() : undefined,
            notes: a.notes ? String(a.notes).trim() : undefined,
          }))
      : [];

    const expenses = Array.isArray(b.expenses)
      ? b.expenses
          .filter((e: any) => e && String(e.label ?? "").trim() !== "")
          .map((e: any) => ({
            label: String(e.label).trim(),
            amount:
              e.amount !== undefined &&
              e.amount !== null &&
              `${e.amount}`.trim() !== ""
                ? Number(e.amount)
                : undefined,
            currency: (e.currency ?? b.currency ?? "EUR")
              .toString()
              .toUpperCase(),
            category: e.category ? String(e.category) : "",
            paidBy: e.paidBy ? String(e.paidBy).trim() : undefined,
          }))
      : [];

    const participants = Array.isArray(b.participants)
      ? b.participants.map((p: any) => String(p))
      : [];

    const payload = {
      userId,
      title: String(b.title).trim(),
      location: String(b.location).trim(), // UI maps destination -> location
      startDate: start,
      endDate: end,
      currency: (b.currency ?? "EUR").toString().toUpperCase(),
      participants,
      notes: b.notes ? String(b.notes) : "",
      activities,
      expenses,
    };

    const trip = new Trip(payload);
    const result = await trip.save();
    res.status(201).json(result);
  } catch (err: any) {
    // bubble up field-level info so you can see exactly what failed
    if (err?.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: Object.fromEntries(
          Object.entries(err.errors).map(([k, v]: any) => [k, v.message])
        ),
      });
    }
    // CastError (e.g., amount: "abc") and others
    if (err?.name === "CastError") {
      return res.status(400).json({ message: `Invalid value for ${err.path}` });
    }
    next(err);
  }
};

const updateTrip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req.user as { _id: string })?._id;

    const trip = await Trip.findOneAndUpdate({ _id: id, userId }, req.body, {
      new: true,
      runValidators: true,
    });
    if (!trip) throw new NotFoundError("Trip not found");

    res.json(trip);
  } catch (err: any) {
    if (err?.name === "ValidationError") {
      return res.status(400).json({ message: "Validation failed" });
    }
    next(err);
  }
};

const deleteTrip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req.user as { _id: string })?._id;

    const trip = await Trip.findOneAndDelete({ _id: id, userId });
    if (!trip) throw new NotFoundError("Trip not found");

    res.json({});
  } catch (err) {
    next(err);
  }
};

export { getTrips, createTrip, getTripById, updateTrip, deleteTrip };
