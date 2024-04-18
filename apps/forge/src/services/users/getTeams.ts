import axiosInstance from "@/api/axiosInstance";
import { ShortTeamWithDesc } from "@ignis/types/users.ts";

export async function getTeams(): Promise<ShortTeamWithDesc[]> {
  try {
    const { data } = await axiosInstance.get("/teams");
    return data;
  } catch (error) {
    console.error(`Error fetching teams: ${error}`);
    throw error;
  }
}
