import { printing } from "@/orpc";
import { cancel } from "./cancel";
import { disable, enable } from "./enabled";
import { filament } from "./filament";
import { finish } from "./finish";
import { pause } from "./pause";
import { resume } from "./resume";
import { statusRouter } from "./status";

export const nameRoutes = printing.prefix("/{name}").router({
  pause,
  resume,
  cancel,
  finish,
  enable,
  disable,
  filament,
  status: statusRouter,
});
