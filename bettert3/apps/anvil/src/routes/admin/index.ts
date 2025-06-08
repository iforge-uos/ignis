import { admin } from "@/router";
import { getGelUI } from "./db";
import { su } from "./su";

export const adminRouter = admin.prefix("/admin").router({
  getGelUI,
  su,
});
