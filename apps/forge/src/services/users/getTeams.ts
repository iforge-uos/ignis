import axiosInstance from "@/api/axiosInstance";
import { team } from "@dbschema/interfaces.ts";

export async function getTeams(): Promise<team.Team[]> {
  try {
    const { data } = await axiosInstance.get("/teams");
    return data;
  } catch (error) {
    console.error(`Error fetching teams: ${error}`);
    throw error;
  }
}
