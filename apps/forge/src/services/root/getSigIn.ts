import axiosInstance from "@/api/axiosInstance";
import { SignIn } from "@ignis/types/root";

export async function getSignIn(id: string): Promise<SignIn> {
  const { data } = await axiosInstance.get(`/sign-ins/${id}`);
  data.created_at = new Date(data.created_at);
  data.ends_at = data.ends_at ? new Date(data.ends_at) : null;
  data.user.created_at = new Date(data.user.created_at);
  return data;
}
