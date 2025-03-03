import axiosInstance from "@/api/axiosInstance";
import { LocationName, SupervisingRep } from "@ignis/types/sign_in";

export async function getSupervisingReps(location: LocationName): Promise<SupervisingRep> {
  try {
    const { data } = await axiosInstance.get(`/location/${location}/supervising-reps`);
    return data;
  } catch (error) {
    console.error(`Error fetching supervisable reps for ${location}: ${error}`);
    throw error;
  }
}
