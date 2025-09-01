import { EventPublisher } from "@orpc/client";
import { sign_in } from "@packages/db/interfaces";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import z from "zod";
import { InitialiseStep, UCardNumber } from "@/api/locations/$name/sign-in/_flows/_steps"; // TODO double check if this actually problematically not shaken
import type {
  Finalise as _Finalise,
  Initialise as _Initialise,
  Receive as _Receive,
  Transmit as _Transmit,
  Graph,
} from "@/api/locations/$name/sign-in/_flows/_types";
import type { PUBLISHER as SERVER_PUBLISHER } from "@/api/locations/$name/sign-in/$ucard";
import { client, orpc } from "@/lib/orpc";
import type { SignInUser } from "@/lib/utils/queries";

type Initialise = z.infer<typeof _Initialise>;
type Receive = z.infer<typeof _Receive>;
type Transmit = z.infer<typeof _Transmit>;
type Finalise = z.infer<typeof _Finalise>;

export const PUBLISHER: typeof SERVER_PUBLISHER = new EventPublisher();

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

const flow = async (
  uCardNumber: z.infer<typeof UCardNumber>,
  locationName: sign_in.LocationName,
  signal: AbortSignal,
) => {
  const commonData = {
    ucard_number: uCardNumber,
    name: locationName,
  };

  const key = `${locationName}-${uCardNumber}` as const;
  const initKey = `${key}-INITIALISE` as const;
  const recvKey = `${key}-RECEIVE` as const;
  console.log("Ok so here")
  const [initialiseTx, receiveTx] = await Promise.all([
    client.locations.signIn.initialise(PUBLISHER.subscribe(initKey, { signal })),
    client.locations.signIn.receive(PUBLISHER.subscribe(recvKey, { signal })),
  ]);
  console.log("It never returns lol")
  const fn = await client.locations.signIn.flow(commonData, { signal });
  // send the data to server, uses the same terminology as server
  const initialise = async <T extends Omit<Initialise, keyof typeof commonData>>(initialise: T) => {
    PUBLISHER.publish(initKey, { ...initialise, ...commonData });
    await initialiseTx.next(); // send it
    return (await fn.next()).value as InitialiseToTransmitMap[T["type"]];
  };

  const receive = async <T extends Omit<Receive, keyof typeof commonData>>(receive: T) => {
    PUBLISHER.publish(recvKey, { ...receive, ...commonData } as Receive);
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

export const Route = createFileRoute("/test/$name/$ucard_number")({
  params: InitialiseStep,
  // loader: async ({ abortController }) => ({ abortController }),
  component: () => {
    const { ucard_number: uCardNumber, name: locationName } = Route.useParams();
    const [user, setUser] = useState<SignInUser | null>(null);
    useEffect(() => {
      (async () => {
        const { initialise, receive } = await flow(uCardNumber, locationName, new AbortController().signal);
        console.log("Out of flow")
        const { user: user_ } = await initialise({ type: "INITIALISE" });
        setUser(user_)
      })();
    });

    console.log("Got the user", user);
    return (
      // <Button
      //   onClick={() =>
      //     (async () => {
      //       // setName(user.display_name);
      //       const finalise = await receive({ type: "INITIALISE" });
      //       console.log("Next step is", finalise.next);
      //     })()
      //   }
      // >
      //   Begin {name}
      // </Button>
      <div>Hi {user?.display_name}</div>
    )
  },
});
