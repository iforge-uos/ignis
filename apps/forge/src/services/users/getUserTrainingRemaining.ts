import axiosInstance from "@/api/axiosInstance";
import { LocationName } from "@ignis/types/sign_in";
import { UserInPersonTrainingRemaining } from "@ignis/types/users";

export async function getUserTrainingRemaining(
  id: string,
  location: LocationName,
): Promise<UserInPersonTrainingRemaining[]> {
  try {
    const { data } = await axiosInstance.get(`/users/${id}/training/remaining/${location}`);
    return data;
  } catch (error) {
    console.error(`Error fetching trainings for ${id}: ${error}`);
    throw error;
  }
}
