import { Document, ObjectId } from "mongoose";

export type ActivityItem = {
  title: string;
  date?: string;
  time?: string;
  location?: string;
  notes?: string;
};

export type ExpenseItem = {
  label: string;
  amount?: number;
  currency?: "EUR" | "USD" | "GBP" | "AUD" | "CAD";
  category?: "transport" | "stay" | "food" | "activity" | "misc" | "";
  paidBy?: string;
};

export type Trip = Document & {
  _id?: string;
  userId: ObjectId;

  title: string;
  location: string; // "City, Country"
  startDate: Date;
  endDate: Date;
  currency: "EUR" | "USD" | "GBP" | "AUD" | "CAD";

  participants: string[];
  notes?: string;

  activities: ActivityItem[];
  expenses: ExpenseItem[];
};
