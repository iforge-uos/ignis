import axiosInstance from "@/api/axiosInstance";

type PromoteUserToRepDto = {
  team_ids: string[];
};

export default async function promoteToRep(user_id: string, data: PromoteUserToRepDto): Promise<PromoteUserToRepDto[]> {
  try {
    const { data: resp } = await axiosInstance.patch(`/users/${user_id}/promote`, data);
    return resp;
  } catch (error) {
    console.error(`Error promoting user ${user_id}: ${error}`);
    throw error;
  }
}
