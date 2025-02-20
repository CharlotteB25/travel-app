export type User = {
  _id: string;
  email: string;
  password: string;
  name: string;
};

export type DashboardData = {
  trips: number;
};
export type UserBody = Omit<User, "_id">;
