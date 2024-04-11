import axiosInstance from "@/api/axiosInstance";
import { Training } from "@ignis/types/users";

type RevokeTrainingDto = {
  reason: string;
};

export default async function revokeTraining(
  id: string,
  training_id: string,
  data: RevokeTrainingDto,
): Promise<Training[]> {
  try {
    const { data: resp } = await axiosInstance.delete(`/users/${id}/training/${training_id}`, { data });
    return resp;
  } catch (error) {
    console.error(`Error fetching trainings for ${id}: ${error}`);
    throw error;
  }
}
