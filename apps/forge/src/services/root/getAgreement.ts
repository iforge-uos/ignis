import axiosInstance from "@/api/axiosInstance";
import { Agreement } from "@ignis/types/root";

export async function getAgreement(id: string): Promise<Agreement> {
  const { data } = await axiosInstance.get(`/agreements/${id}`);
  data.created_at = new Date(data.created_at);
  return data;
}
