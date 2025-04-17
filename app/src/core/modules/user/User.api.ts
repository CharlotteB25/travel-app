import { API } from "@core/network/api";
import { DashboardData, User, UserBody } from "./User.types";

export const getCurrentUser = () => {
  return API.get<User>("/users/current");
};

export const getDashboardData = () => {
  return API.get<DashboardData>("/users/current/dashboard");
};

export const updateUser = (id: string, body: UserBody) => {
  return API.patch<User>(`/users/${id}`, body);
};
