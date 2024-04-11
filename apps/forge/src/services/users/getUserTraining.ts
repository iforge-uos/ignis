import axiosInstance from "@/api/axiosInstance";
import { Training } from "@ignis/types/users";

export async function getUserTraining(id: string): Promise<Training[]> {
  try {
    const { data } = await axiosInstance.get(`/users/${id}/training`);
    for (const training of data) {
      training["@created_at"] = training["@created_at"] ? new Date(training["@created_at"]) : undefined;
      training["@in_person_created_at"] = training["@in_person_created_at"]
        ? new Date(training["@in_person_created_at"])
        : undefined;
      training.renewal_due = training.renewal_due ? new Date(training.renewal_due) : undefined;
    }
    return data;
  } catch (error) {
    console.error(`Error fetching trainings for ${id}: ${error}`);
    throw error;
  }
}
