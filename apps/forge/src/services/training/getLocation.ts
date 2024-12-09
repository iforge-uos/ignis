import axiosInstance from "@/api/axiosInstance";
import type { training } from "@ignis/types";

export async function getLocation(location: training.LocationName): Promise<training.PartialTraining[]> {
  try {
    const { data } = await axiosInstance.get(`/training/location/${location}`);
    for (const training of data) {
      training.created_at = new Date(training.created_at);
      training.update_at = new Date(training.update_at);
    }
    return data;
  } catch (error) {
    console.error("Error fetching training", error);
    return [];
  }
}
