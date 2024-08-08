import { Trip, TripBody } from "./types";
import { API } from "@core/network/api";

const getTrips = () => {
  return API.get<Trip[]>("/trips");
};

const getTripById = (id: string) => {
  return API.get<Trip>(`/trips/${id}`);
};

const createTrip = (trip: TripBody) => {
  return API.post<Trip>("/trips/add", trip);
};

const updateTrip = (id: string, trip: TripBody) => {
  return API.patch<Trip>(`/trips/${id}`, trip);
};

export { getTrips, getTripById, createTrip, updateTrip };
