//signinRasonService.ts
import axiosInstance from "@/api/axiosInstance.ts";
import { SIGN_IN_REASONS_STORAGE_KEY } from "@/config/constants.ts";
import { Location, PartialReason, Reason } from "@ignis/types/sign_in";
import { UseQueryResult, useQuery } from "@tanstack/react-query";

type LocalSignInReasonsData = {
  lastModified: string;
  signInReasons: Reason[];
};

export const fetchSignInReasonsLastModified = async (): Promise<Date> => {
  const response = await axiosInstance.get("sign-in-reasons-last-update");
  const lastModified = response.headers["last-modified"];
  return new Date(lastModified);
};

export const fetchSignInReasons = async (): Promise<Reason[]> => {
  const response = await axiosInstance.get("sign-in-reasons");
  return response.data;
};

export const getCommonReasons = async (location: Location): Promise<PartialReason[]> => {
  const {data} =  await axiosInstance.get(`/location/${location}/common-reasons`);
  return data
}

export const useSignInReasons = (): UseQueryResult<Reason[], unknown> => {
  return useQuery({
    queryKey: ["signInReasons"],
    queryFn: async (): Promise<Reason[]> => {
      const localData = getLocalSignInReasons();
      const lastModified = await fetchSignInReasonsLastModified();
      //TODO FIX THIS
      if (!localData || lastModified > new Date(localData.lastModified)) {
        const data = await fetchSignInReasons();
        storeLocalSignInReasons(data, lastModified);
        return data;
      }

      return localData.signInReasons;
    },
  });
};

const getLocalSignInReasons = (): LocalSignInReasonsData | null => {
  const localDataJSON = localStorage.getItem(SIGN_IN_REASONS_STORAGE_KEY);
  return localDataJSON ? JSON.parse(localDataJSON) : null;
};

const storeLocalSignInReasons = (signInReasons: Reason[], lastModified: Date): void => {
  const dataToStore: LocalSignInReasonsData = {
    lastModified: lastModified.toISOString(),
    signInReasons,
  };
  localStorage.setItem(SIGN_IN_REASONS_STORAGE_KEY, JSON.stringify(dataToStore));
};
