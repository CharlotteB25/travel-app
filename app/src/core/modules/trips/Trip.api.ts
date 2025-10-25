// Trip.api.ts
import { Trip, TripBody } from "./Trip.types";
import { API } from "@core/network/api";

export const getTrips = () => API.get<Trip[]>("/trips");
export const getTripById = (id: string) => API.get<Trip>(`/trips/${id}`);
export const createTrip = (trip: TripBody) => API.post<Trip>("/trips", trip);
export const updateTrip = (id: string, trip: TripBody) =>
  API.patch<Trip>(`/trips/${id}`, trip);
export const deleteTrip = (id: string) => API.delete(`/trips/${id}`);
