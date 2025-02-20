import express from "express";
import {
  getTrips,
  createTrip,
  getTripById,
  updateTrip,
  deleteTrip,
} from "./Trip.controller";
import { authJwt } from "../../middleware/auth/authMiddleware"; // Import JWT auth middleware if needed

const router = express.Router();

// Protected routes
router.get("/trips", authJwt, getTrips); // GET request for trips
router.get("/trips/:id", authJwt, getTripById); // GET request for a single trip by ID
router.post("/trips", authJwt, createTrip); // POST request to create a new trip
router.patch("/trips/:id", authJwt, updateTrip); // PATCH request to update a trip
router.delete("/trips/:id", authJwt, deleteTrip); // DELETE request to delete a trip

export default router;
