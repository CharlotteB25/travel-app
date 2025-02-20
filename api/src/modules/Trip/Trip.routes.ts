import express from "express";
import {
  createTrip,
  getTripById,
  getTrips,
  updateTrip,
  deleteTrip,
} from "./Trip.controller";
import { authJwt } from "../../middleware/auth/authMiddleware"; // Import the authJwt middleware

const router = express.Router();

// Protect trips route with JWT authentication
router.get("/trips", authJwt, getTrips); // Use authJwt middleware here
router.get("/trips/:id", authJwt, getTripById); // Use authJwt middleware here
router.post("/trips", authJwt, createTrip); // Use authJwt middleware here
router.patch("/trips/:id", authJwt, updateTrip); // Use authJwt middleware here
router.delete("/trips/:id", authJwt, deleteTrip); // Use authJwt middleware here

export default router;
