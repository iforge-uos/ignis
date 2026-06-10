import { threeDP } from "@/orpc";
//import { historyRouter } from "./history";
import { printerRouter } from "./printer";
//import { queueRouter } from "./queue";
import { connect, disconnect, reconnect } from "./$name";


export const printRouter = threeDP.prefix("/print").router({
    connect,
    disconnect,
    reconnect,
//    ...historyRouter,
    ...printerRouter,
//    ...queueRouter
});
