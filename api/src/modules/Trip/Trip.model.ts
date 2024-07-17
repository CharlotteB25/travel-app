import mongoose from "mongoose";
//import validateModel from "../../validation/validateModel";
import { Trip } from "./Trip.types";

// Define the interface for the Trip document

// Define the Trip schema
const tripSchema = new mongoose.Schema<Trip>({
  title: {
    type: String,
    required: true,
  },
  _id: {
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
  description: {
    type: String,
    required: true,
  },
  expenses: [
    {
      amount: {
        type: Number,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
    },
  ],
  activities: [
    {
      name: {
        type: String,
        required: true,
      },
      status: {
        type: Boolean,
        required: true,
      },
    },
  ],
});

// Middleware to validate model before saving
/* tripSchema.pre("save", function (next) {
  validateModel(this);
  next();
}); */

// You mentioned some middleware related to deleting projects, but it seems unrelated to the Trip schema.
// If you have a Project model and want to handle related documents, ensure that ProjectModel is defined and imported correctly.

const TripModel = mongoose.model<Trip>("Trip", tripSchema);

export default TripModel;
