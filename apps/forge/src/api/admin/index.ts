import { admin } from "@/orpc";
import { getGelUI } from "./db";
import { su } from "./su";
import { promote } from "./reps.promote.$id"

export const adminRouter = admin.prefix("/admin").router({
  getGelUI,
  su,
  promote,
});
