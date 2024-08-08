export type Trip = {
  _id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  activity: string;
  expenses: string;
  notes: string;
};

export type TripBody = Omit<Trip, "_id">;
