import { Document, ObjectId } from "mongoose";

export type Trip = Document & {
  _id?: string;
  title: string;
  //description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  notes: string;
  expenses: string;
  activity: string;
  userId: ObjectId;
};
