import { printing } from "@/orpc";
import { pause } from "./pause";
import { resume } from "./resume";
import { cancel } from "./cancel";
import { finish } from "./finish";
import { enable, disable } from "./enabled";
import { filament } from "./filament";
import { statusRouter } from "./status"

export const nameRoutes = printing.prefix("/{name}").router({
    pause,
    resume,
    cancel,
    finish,
    enable,
    disable,
    filament,
    statusRouter,
});