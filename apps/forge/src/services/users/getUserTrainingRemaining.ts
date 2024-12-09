import axiosInstance from "@/api/axiosInstance";
import { sign_in } from "@ignis/types";
import { LocationName } from "@ignis/types/sign_in";

export async function getUserTrainingRemaining(id: string, location: LocationName): Promise<sign_in.Training[]> {
  try {
    const { data } = await axiosInstance.get(`/users/${id}/training/remaining/${location}`);
    return data;
  } catch (error) {
    console.error(`Error fetching trainings for ${id}: ${error}`);
    throw error;
  }
}
