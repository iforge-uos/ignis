import { userAtom } from "@/atoms/authSessionAtoms";
import { useAtom } from "jotai";

export function useUser() {
  const [user] = useAtom(userAtom);
  return user;
}
