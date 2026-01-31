import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { orpc } from "@/lib/orpc";
import { reasonsAtom, reasonsLastUpdatedAtom } from "../atoms/signInAppAtoms";

export const useSignInReasons = () => {
  const [{ data: reasons }, dispatch] = useAtom(reasonsAtom);
  const [cachedLastUpdated, setCachedLastUpdated] = useAtom(reasonsLastUpdatedAtom);
  const { data: lastUpdated } = useQuery(orpc.signIns.reasons.lastUpdate.queryOptions());

  if (!reasons || !lastUpdated || !cachedLastUpdated) return null;

  if (cachedLastUpdated < lastUpdated) {
    dispatch({ type: "update" });
    setCachedLastUpdated(lastUpdated);
    return null;
  }

  return reasons;
};
