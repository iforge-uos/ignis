import { printing } from "@/orpc";
import { pause } from "./pause";
import { resume } from "./resume";
import { cancel } from "./cancel";
import { finish } from "./finish";

export const nameRoutes = printing.prefix("/{name}").router({
    pause,
    resume,
    cancel,
    finish,
});