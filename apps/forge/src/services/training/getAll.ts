import axiosInstance from "@/api/axiosInstance";
import type { training } from "@ignis/types";

export async function getAll(): Promise<training.AllTraining[]> {
  const { data } = await axiosInstance.get("/training");
  return data;
}
