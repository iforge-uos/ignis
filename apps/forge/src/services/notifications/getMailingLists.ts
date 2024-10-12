import axiosInstance from "@/api/axiosInstance";
import { MailingList } from "@ignis/types/notifications";

export async function getMailingLists(): Promise<MailingList[]> {
  try {
    const { data } = await axiosInstance.get("/notifications/mailing-lists");
    return data;
  } catch (error) {
    console.error(`Error fetching mailing lists: ${error}`);
    throw error;
  }
}
