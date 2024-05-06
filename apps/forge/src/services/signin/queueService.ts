import axiosInstance from "@/api/axiosInstance.ts";
import axios from "axios";

export interface PostQueueProps {
  signal: AbortSignal;
  locationName: string;
  userId: string;
}

export const PostQueue = async ({ locationName, userId, signal }: PostQueueProps): Promise<string> => {
  try {
    const { data } = await axiosInstance.post(`/location/${locationName}/queue/add/${userId}`, {}, { signal: signal });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // This is an API error
      console.error("API error occurred while posting to /queue/in-person:", error.response.data);
      throw new Error(error.response.data.message || "An error occurred with the API.");
    } else {
      // This is an Axios error (network problem, etc.)
      throw error;
    }
  }
};
