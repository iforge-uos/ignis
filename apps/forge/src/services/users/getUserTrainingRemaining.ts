import axiosInstance from "@/api/axiosInstance";
import { UserInPersonTrainingRemaining } from "@ignis/types/users";

export async function getUserTrainingRemaining(id: string): Promise<UserInPersonTrainingRemaining[]> {
  try {
    const { data } = await axiosInstance.get(`/users/${id}/training/remaining`);
    return data;
  } catch (error) {
    console.error(`Error fetching trainings for ${id}: ${error}`);
    throw error;
  }
}
