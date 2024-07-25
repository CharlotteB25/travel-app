import { Router } from "express";
import {
  getTrips,
  createTrip,
  getTripById,
  updateTrip,
  deleteTrip,
} from "./Trip.controller";

const router = Router();

router.get("/trips", getTrips);
router.post("/trips", createTrip);
router.get("/trips/:id", getTripById);
router.patch("/trips/:id", updateTrip);
router.delete("/trips/:id", deleteTrip);

export default router;
