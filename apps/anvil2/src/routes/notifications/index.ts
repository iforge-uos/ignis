import { auth } from "@/router";
import { mailingListRouters } from "./mailing-lists";

export const notificationsRouter = auth.prefix("/notifications").router({ mailingLists: mailingListRouters });
