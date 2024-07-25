import { API } from "@core/network/api";
import { Trip } from "@core/modules/trips/types";

const getTrips = () => {
  return API.get<Trip[]>("/trips");
};

const getTripById = (id: string) => {
  return API.get<Trip>(`/trips/${id}`);
};

export { getTrips, getTripById };
