import axiosInstance from "@/api/axiosInstance";

type CreateInfractionDto = {
  created_at: Date;
  duration?: string;
  reason: string;
  resolved: boolean;
  type: string;
};

export default async function addInfraction(id: string, data: CreateInfractionDto) {
  try {
    const { data: resp } = await axiosInstance.post(`/users/${id}/infractions`, { data });
    return resp;
  } catch (error) {
    console.error(`Error adding infraction for ${id}: ${error}`);
    throw error;
  }
}
