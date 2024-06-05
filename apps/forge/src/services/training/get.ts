import axiosInstance from "@/api/axiosInstance";
import type { Training } from "@ignis/types/training";

export async function get(id: string, params: { editing?: boolean }): Promise<Training> {
  try {
    const { data } = await axiosInstance.get(`/training/${id}`, { params });
    data.created_at = new Date(data.created_at);
    data.updated_at = new Date(data.updated_at);
    return data;
  } catch (error) {
    console.error("Error fetching training:", error);
    throw error;
  }
}
