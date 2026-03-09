import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { orpc } from "@/lib/orpc";
import { reasonsAtom, reasonsLastUpdatedAtom } from "../atoms/signInAppAtoms";

export const useSignInReasons = () => {
  const [reasons, setReasons] = useAtom(reasonsAtom);
  const [cachedLastUpdatedDate, setCachedLastUpdatedDate] = useAtom(reasonsLastUpdatedAtom);
  const { data: lastUpdated, isLoading } = useQuery(orpc.signIns.reasons.lastUpdate.queryOptions());

  return useQuery({
    ...orpc.signIns.reasons.all.queryOptions(),
    queryKey: [orpc.signIns.reasons.all.queryKey(), lastUpdated],
    enabled: !isLoading,
    staleTime: Infinity,
    select: (data) => {
      // I don't think this is really how this is meant to be used but there's no onSuccess
      setReasons(data);
      return data;
    },
    initialData: () => {
      if (!lastUpdated) return undefined;
      const lastUpdatedDate = new Date(lastUpdated.epochMilliseconds); // temporal can't save us from json being shit
      if (!reasons || !cachedLastUpdatedDate || lastUpdatedDate > cachedLastUpdatedDate) {
        setCachedLastUpdatedDate(lastUpdatedDate);
        return undefined; // triggers refresh
      }
      return reasons;
    },
  });
};
