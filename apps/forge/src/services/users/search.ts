import axiosInstance from "@/api/axiosInstance";
import { User } from "@ignis/types/users";

export async function search(query: string): Promise<User[]> {
  try {
    const {data} = await axiosInstance.get("/users/search", { params: { query } });
    data.forEach((user) => {
      user.created_at = new Date(user.created_at)
    });
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}
