import axiosInstance from "@/api/axiosInstance";
import type { Training } from "@ignis/types/training";

export async function get(id: string): Promise<Training> {
  try {
    const { data } = await axiosInstance.get(`/training/${id}`);
    data.created_at = new Date(data.created_at);
    data.updated_at = new Date(data.updated_at);
    return data;
  } catch (error) {
    console.error("Error fetching training:", error);
    throw error;
  }
}
