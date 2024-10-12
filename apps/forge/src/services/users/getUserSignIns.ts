import axiosInstance from "@/api/axiosInstance";
import { SignInStat } from "@ignis/types/users";

export default async function getUserSignIns(id: string): Promise<SignInStat[]> {
  try {
    const { data } = await axiosInstance.get(`/users/${id}/sign-ins`);
    data.forEach((sign_in_stat: any) => {
      for (const sign_in of sign_in_stat.sign_ins) {
        sign_in.created_at = new Date(sign_in.created_at);
        sign_in.ends_at = sign_in.ends_at ? new Date(sign_in.ends_at) : null;
      }
    });
    return data;
  } catch (error) {
    console.error(`Error fetching sign ins for ${id}: ${error}`);
    return [];
  }
}
