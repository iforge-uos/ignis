import axiosInstance from "@/api/axiosInstance";
import type { Location, UserTrainingStatuses } from "@ignis/types/training";

export async function getStatus(location: Location): Promise<UserTrainingStatuses> {
  try {
    const { data } = await axiosInstance.get(`/training/location/${location}/statuses`);
    return data;
  } catch (error) {
    console.error("Error fetching statuses:", error);
    throw error;
  }
}
