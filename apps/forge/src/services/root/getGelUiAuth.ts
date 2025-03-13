import axiosInstance from "@/api/axiosInstance";

export async function getGelUiAuth(): Promise<string> {
  const { data } = await axiosInstance.get("/gel-ui-auth");
  return data;
}
