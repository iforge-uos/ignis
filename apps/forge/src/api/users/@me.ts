import { pub } from "@/orpc";

// createContext already loads the current user (or null for guests) on every request, so reuse it
export const me = pub.route({ method: "GET", path: "/@me" }).handler(async ({ context: { user } }) => user);
