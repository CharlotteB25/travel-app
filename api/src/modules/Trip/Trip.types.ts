import { Document } from "mongoose";

export type Trip = Document & {
  _id?: string;
  title: string;
  startDate: Date;
  endDate: Date;
  description: string;
  location: string;
  expenses: {
    amount: number;
    name: string;
  };
  activities: string;
  status: boolean;
};
