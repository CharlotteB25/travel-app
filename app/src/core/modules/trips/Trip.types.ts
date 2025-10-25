// Trip.types.ts

export type ActivityItem = {
  title: string;
  date?: string; // keep as 'YYYY-MM-DD' if you like
  time?: string; // 'HH:mm'
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

export type Trip = {
  _id: string;
  userId: string;

  title: string;
  location: string; // "City, Country"
  startDate: string; // ISO string from API (OK to keep as string)
  endDate: string; // ISO string
  currency: "EUR" | "USD" | "GBP" | "AUD" | "CAD";

  participants: string[];
  notes?: string;

  activities: ActivityItem[];
  expenses: ExpenseItem[];

  createdAt?: string;
  updatedAt?: string;
};

// What the client sends to create/update
export type TripBody = Omit<Trip, "_id" | "userId" | "createdAt" | "updatedAt">;
