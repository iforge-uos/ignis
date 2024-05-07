import axiosInstance from "@/api/axiosInstance";
import { Agreement } from "@ignis/types/root";

export async function getAgreements(): Promise<Agreement[]> {
  const { data } = await axiosInstance.get(`/agreements`);
  data.map((agreement: any) => {
    agreement.created_at = new Date(agreement.created_at);
  });
  return data;
}
