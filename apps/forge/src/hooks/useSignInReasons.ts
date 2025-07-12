import { client, orpc } from "@/lib/orpc";
import { SIGN_IN_REASONS_STORAGE_KEY } from "@/lib/constants.ts";
import { LocationName, PartialReason, Reason } from "@ignis/types/sign_in";
import { UseQueryResult, useQuery } from "@tanstack/react-query";

type LocalSignInReasonsData = {
  lastModified: string;
  signInReasons: Reason[];
};

export const getCommonReasons = async (location: LocationName, rep?: boolean): Promise<PartialReason[]> => {
  return await client.locations.commonReasons({ name: location, is_rep: rep });
};

export const useSignInReasons = (): UseQueryResult<Reason[], unknown> => {
  return useQuery({
    queryKey: ["signInReasons"],
    queryFn: async () => {
      const localData = getLocalSignInReasons();
      const lastModified = await client.signIns.reasons.lastUpdate();
      //TODO FIX THIS
      if (!localData || lastModified > new Date(localData.lastModified)) {
        const data = await client.signIns.reasons.all();
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
