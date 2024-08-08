import { Document, ObjectId } from "mongoose";
import { Trip } from "../Trip/Trip.types";

export type Log = Document & {
  _id?: string;
  description: string;
  duration: number;
  date: Date;
  ownerId: ObjectId;
  tripId: ObjectId;
  trip: Trip;
};
