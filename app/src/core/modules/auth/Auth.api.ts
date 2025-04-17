import { API } from "@core/network/api";
import { Auth } from "./Auth.types";

type LoginBody = {
  email: string;
  password: string;
};

type RegisterBody = {
  email: string;
  password: string;
  name: string;
};

// Function to handle user login
export const login = (body: LoginBody) => {
  return API.post<Auth>("/login", body);
};

// Function to handle user registration
export const register = (body: RegisterBody) => {
  return API.post<Auth>("/register", body);
};
