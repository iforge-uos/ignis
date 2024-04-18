import axiosInstance from "@/api/axiosInstance";

export default async function promoteToRep(user_id: string, team_id: string) {
  try {
    const { data: resp } = await axiosInstance.post(`/users/${user_id}/promote/${team_id}`);
    return resp;
  } catch (error) {
    console.error(`Error promoting user ${user_id} to team ${team_id}: ${error}`);
    throw error;
  }
}
