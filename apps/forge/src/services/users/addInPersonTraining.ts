import axiosInstance from "@/api/axiosInstance";
import { Training } from "@ignis/types/users";

type AddInPersonTrainingDto = {
  rep_id: string;
  created_at: Date;
};

export default async function (id: string, training_id: string, data: AddInPersonTrainingDto): Promise<Training[]> {
  try {
    const { data: resp } = await axiosInstance.post(`/users/${id}/training/${training_id}`, data);
    return resp;
  } catch (error) {
    console.error(`Error fetching trainings for ${id}: ${error}`);
    throw error;
  }
}
