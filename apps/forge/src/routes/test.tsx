import { EventPublisher } from "@orpc/client";
import { sign_in } from "@packages/db/interfaces";
import { Button } from "@packages/ui/components/button";
import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import z from "zod";
import type { InitialiseStep, StepType } from "@/api/locations/$name/sign-in/_flows/_steps";
import type {
  Finalise as _Finalise,
  Initialise as _Initialise,
  Receive as _Receive,
  Transmit as _Transmit,
  Graph,
} from "@/api/locations/$name/sign-in/_flows/_types";
import { client, orpc } from "@/lib/orpc";
import { exhaustiveGuard } from "@/lib/utils";

type Initialise = z.infer<typeof _Initialise>;
type Receive = z.infer<typeof _Receive>;
type Transmit = z.infer<typeof _Transmit>;
type Finalise = z.infer<typeof _Finalise>;

const UCardNumber = z
  .string()
  .regex(/\d{9,}/)
  .brand("uCardNumber");
type UCardNumber = z.infer<typeof UCardNumber>;
export type BaseKey = `${sign_in.LocationName}-${UCardNumber}`;

export const PUBLISHER = new EventPublisher<{
  [KeyT in `${BaseKey}-INITIALISE` | `${BaseKey}-RECEIVE`]: KeyT extends `${BaseKey}-INITIALISE` ? Initialise : Receive;
}>();

// represents https://www.mermaidchart.com/play#pako:eNptVE2P2jAQ_SujHNrtAZWwsLAc2iJaVXtopbbsoWr24CQDWCR21mNDEeK_d-x88FEuiEzePL_3PJNDlOkco2nU6_USlWm1lKtpogDsGkucgkLtnwqtN6cHsdfOTmEp_2KeqNC5LPQuWwtjYfHZYwDU5JBEz4QGMqGA5EqBVJAKwhy0gleHDoGssJhER-j14Lvm3w-g4tGfJHoiMLiSZNHwGdFLy-mBv5Fq5ODwH_DYAAfnjEPGfRMbDKagMnorSWolimJfCxMrg2xX2SuC7qT4vjWjtA097ILtYEG4W_PRp8ahb5y1hOBUjoas1jkIlbetgXTEnDPagNVALqXMyLSRyJVSyEKqFRRsja7YF1pD6mhf0zxwXF_Rdp3Bkau8zwoNW-S0-R3sMCVpMciwTRqMd8b_MQh3KWbCkQeC4GcqRFli_u6U_tgL7pxla8w2VF-ejyjmt3NdVq4gbfawMEIq72DucScHcdzg-6z7JwpieU-qcpz9C7zh-pjrX4zRBnQotodfzMjwlmlpr7yeuketyFZFvykMmKiTKr0OuPN3bPDVSR4pWLIQgxW9xy27prM44vuaY-xlD_q3Zceji0F6bO5cLr3OPewEJ8n6wzqchTS6cPvw6cBbl2IxBZ54xZLKoIk5RMgAnJ9NSeqtvVgH6Agn9a78CGs3y6zcYrDm98JQJTL82F3lpG26MW3x402fFHP5l9_057kwfmMbeMflPdBaVPxRMZhZFhYd_wHo9mxr
// I'm calling this structure an adjacency object (It's a named adjacency list)
const GRAPH = {
  INITIALISE: ["AGREEMENTS", "QUEUE", "REASON", "SIGN_OUT"],
  AGREEMENTS: ["MAILING_LISTS"],
  CANCEL: [undefined],
  MAILING_LISTS: ["REASON"],
  PERSONAL_TOOLS_AND_MATERIALS: ["TOOLS"],
  QUEUE: [undefined],
  REASON: ["FINALISE", "PERSONAL_TOOLS_AND_MATERIALS"],
  TOOLS: ["FINALISE"],
  FINALISE: [undefined],
  SIGN_OUT: [undefined],
} as const satisfies Graph;

type InitialiseToTransmitMap = { [K in Initialise["type"]]: Extract<Transmit, { type: K }> };
type ReceiveToFinaliseMap = { [K in Receive["type"]]: Extract<Finalise, { type: K }> };

const flow = async (uCardNumber: z.infer<typeof UCardNumber>, locationName: sign_in.LocationName) => {
  const commonData = {
    ucard_number: uCardNumber,
    name: locationName,
  };

  const fn = await client.locations.signIn.flow(commonData);
  const key = `${locationName}-${uCardNumber}` as const;
  const initialiseTx = await client.locations.signIn.initialise(PUBLISHER.subscribe(`${key}-INITIALISE`));
  const receiveTx = await client.locations.signIn.receive(PUBLISHER.subscribe(`${key}-RECEIVE`));

  // send the data to server, uses the same terminology as server
  const initialise = async <T extends Omit<Initialise, keyof typeof commonData>>(initialise: T) => {
    PUBLISHER.publish(`${key}-INITIALISE`, { ...initialise, ...commonData });
    await initialiseTx.next(); // send it
    return (await fn.next()).value as InitialiseToTransmitMap[T["type"]];
  };

  const receive = async <T extends Omit<Receive, keyof typeof commonData>>(receive: T) => {
    PUBLISHER.publish(`${key}-RECEIVE`, { ...receive, ...commonData } as Receive);
    await receiveTx.next(); // send it
    type FinaliseT = ReceiveToFinaliseMap[T["type"]];
    return (await fn.next()).value as FinaliseT extends never
      ? T["type"] extends "FINALISE" // only FINALISE returns a value of the ends of the graph
        ? { id: string }
        : undefined
      : FinaliseT;
  };
  return { initialise, receive };
};

export const Route = createFileRoute("/test")({
  component: async () => {
    const uCardNumber = UCardNumber.parse("000786768");
    const locationName = "MAINSPACE" as const;

    // const user = { display_name: "James H-B" };
    // console.log("User", user);
    const [name, setName] = useState<string | null>();
    const { initialise, receive } = await flow(uCardNumber, locationName);
    const { user } = await initialise({ type: "INITIALISE" });
     // TODO ask about the async server component status and if theres a way to make this work cause itll make the code way nicer

    return (
      // <div>Hi {user.display_name}</div>
      <Button
        onClick={() =>
          (async () => {
            // setName(user.display_name);
            const finalise = await receive({ type: "INITIALISE" });
            console.log("Next step is", finalise.next);
          })()
        }
      >
        Begin {name}
      </Button>
    );
    // while (true) {
    //   const {value: message, done} = await creator.next({type: "lol"});

    //   if (done) {
    //     message
    //     return "Signed In yippee"
    //   }

    //   switch (message.type) {
    //     case "INITIALISE":
    //       message.user;

    //       break;
    //     default:
    //       exhaustiveGuard(message);
    //   }
    // }
  },
});
