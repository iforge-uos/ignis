import axiosInstance from "@/api/axiosInstance.ts";
import axios from "axios";


export interface PostQueueProps {
    signal: AbortSignal;
    locationName: string;
    uCardNumber: number;
}

export const PostQueueInPerson = async ({
                                            locationName,
                                            uCardNumber,
                                            signal
                                        }: PostQueueProps): Promise<string> => {
    try {
        const {data} = await axiosInstance.post(`/location/${locationName}/queue/in-person/${uCardNumber}`, {}, {signal: signal});
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