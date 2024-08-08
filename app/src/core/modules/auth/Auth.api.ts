import { API } from "@core/network/api";
import { Auth } from "./Auth.types";
import axios from "axios";

type LoginBody = {
  email: string;
  password: string;
};
export const login = async (userData: { email: string; password: string }) => {
  // Replace with the correct API server URL
  const response = await axios.post(
    "http://localhost:3003/api/login",
    userData
  );
  return response.data;
};
