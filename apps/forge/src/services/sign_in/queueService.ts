import axiosInstance from "@/api/axiosInstance.ts";
import { LocationName } from "@ignis/types/sign_in";
import axios from "axios";

export interface PostQueueProps {
  signal: AbortSignal;
  locationName: LocationName;
  uCardNumber: string;
}

export const PostQueue = async ({ locationName, uCardNumber, signal }: PostQueueProps): Promise<string> => {
  try {
    const { data } = await axiosInstance.post(
      `/location/${locationName}/queue`,
      { ucard_number: uCardNumber },
      { signal: signal },
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // This is an API error
      console.error("API error occurred while posting to /queue/in-person:", error.response.data);
      throw error;
    }
    // This is an Axios error (network problem, etc.)
    throw error;
  }
};

export interface DeleteQueueProps {
  locationName: LocationName;
  id: string;
}

export const DeleteQueue = async ({ locationName, id }: DeleteQueueProps): Promise<string> => {
  try {
    const { data } = await axiosInstance.delete(`/location/${locationName}/queue/${id}`);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // This is an API error
      console.error("API error occurred while posting to /queue/in-person:", error.response.data);
      throw error;
    }
    // This is an Axios error (network problem, etc.)
    throw error;
  }
};
