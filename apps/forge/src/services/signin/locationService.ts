import axiosInstance from "@/api/axiosInstance.ts";
import { List, LocationStatus } from "@ignis/types/sign_in.ts";

export const locationStatus = async (): Promise<LocationStatus[]> => {
  try {
    const { data } = await axiosInstance.get<{ [key: string]: Omit<LocationStatus, "locationName"> }>("/status");

    if (!data) {
      return [];
    }

    return Object.entries(data).map(([key, value]) => ({
      locationName: key.toLowerCase(),
      ...value,
    }));
  } catch (error) {
    console.error("An error occurred while fetching locations:", error);
    throw error;
  }
};

export const dataForLocation = async (location: string): Promise<List> => {
  try {
    const { data } = await axiosInstance.get<List>(`/location/${location}`);

    return data;
  } catch (error) {
    console.error("An error occurred while fetching data for location:", error);
    throw error;
  }
};
