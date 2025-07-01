import { auth } from "@/orpc";
import { mailingListRouters } from "./mailing-lists";

export const notificationsRouter = auth.prefix("/notifications").router({ mailingLists: mailingListRouters });
