import { RouterUtils } from "@orpc/react-query";
import { createContext, useContext } from "react";
import type { ORPCRouter } from "@ignis/types/orpc";

type ORPCReactUtils = RouterUtils<ORPCRouter>;

export const ORPCContext = createContext<ORPCReactUtils | undefined>(undefined);

export function useORPC(): ORPCReactUtils {
  const orpc = useContext(ORPCContext);
  if (!orpc) {
    throw new Error("ORPCContext is not set up properly");
  }
  return orpc;
}
