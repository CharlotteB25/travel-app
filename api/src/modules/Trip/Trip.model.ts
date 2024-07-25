import { NextFunction } from "express";
import mongoose from "mongoose";
import validateModel from "../../validation/validateModel";

const tripSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
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
    activity: [
      {
        type: String,
        required: true,
      },
    ],
    expenses: [
      {
        type: Number,
        required: true,
      },
    ],
    notes: {
      type: String,
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

const Trip = mongoose.model("Trip", tripSchema);

export default Trip;
