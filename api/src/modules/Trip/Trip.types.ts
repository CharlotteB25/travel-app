import { Document, ObjectId } from "mongoose";

export type Trip = Document & {
  _id?: ObjectId;
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  notes: string;
};
