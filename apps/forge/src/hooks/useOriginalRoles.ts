import { userAtom } from "@/atoms/authSessionAtoms";
import { useAtomValue } from "jotai";

export function useOriginalUserRoles() {
  return useAtomValue(userAtom)?.roles.map(({name}) => name.toLowerCase()) ?? [];
}