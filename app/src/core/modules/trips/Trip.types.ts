export type Trip = {
  _id: string;
  title: string;
  //description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  activity: string;
  expenses: string;
  notes: string;
  userId: string;
};

export type TripBody = Omit<Trip, "_id">;
