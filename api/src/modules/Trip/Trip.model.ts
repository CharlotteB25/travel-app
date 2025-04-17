import { NextFunction } from "express";
import mongoose from "mongoose";
import validateModel from "../../validation/validateModel";
import { Trip } from "./Trip.types";

const tripSchema = new mongoose.Schema<Trip>(
  {
    title: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      required: true,
    },
    expenses: {
      type: String,
      required: true,
    },
    activity: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

tripSchema.pre("save", function (next) {
  validateModel(this);
  next();
});

const TripModel = mongoose.model<Trip>("Trip", tripSchema);

export default TripModel;
