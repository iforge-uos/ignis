import axiosInstance from "@/api/axiosInstance.ts";
import { Location, LocationName, PartialLocation } from "@ignis/types/sign_in.ts";

export const locationStatus = async (): Promise<{ [KeyT in LocationName]: PartialLocation }> => {
  try {
    const { data } = await axiosInstance.get<{ [KeyT in LocationName]: PartialLocation }>("/status");
    return data;
  } catch (error) {
    console.error("An error occurred while fetching locations:", error);
    throw error;
  }
};

export const dataForLocation = async (location: LocationName): Promise<Location> => {
  try {
    const { data } = await axiosInstance.get<Location>(`/location/${location}`);
    for (const place of data.queued) {
      // @ts-ignore parsing data
      place.created_at = new Date(place.ends_at);
      place.ends_at = place.ends_at ? new Date(place.ends_at) : null;
    }
    return data;
  } catch (error) {
    console.error("An error occurred while fetching data for location:", error);
    throw error;
  }
};
