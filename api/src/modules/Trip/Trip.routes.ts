import express from "express";
import {
  createTrip,
  getTripById,
  getTrips,
  updateTrip,
  deleteTrip,
} from "./Trip.controller";

const router = express.Router();

router.get("/trips", getTrips);
router.get("/trips/:id", getTripById);
router.post("/trips", createTrip);
router.patch("/trips/:id", updateTrip);
router.delete("/trips/:id", deleteTrip);

export default router;
