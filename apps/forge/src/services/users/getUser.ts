import axiosInstance from "@/api/axiosInstance";
import { User } from "@ignis/types/users";

export async function getUser(id: string): Promise<User> {
  try {
    const { data } = await axiosInstance.get(`/users/${id}`);
    data.created_at = new Date(data.created_at);
    for (const agreement of data.agreements_signed) {
      agreement.created_at = new Date(agreement.created_at);
    }
    return data;
  } catch (error) {
    console.error(`Error fetching user ${id}: ${error}`);
    throw error;
  }
}
