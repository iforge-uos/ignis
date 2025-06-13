import { deskOrAdmin, transaction } from "@/orpc";
import { exhaustiveGuard } from "@/lib/utils";
import { ensureUser } from "@/lib/utils/sign-in";
import e from "@packages/db/edgeql-js";
import { sign_in } from "@packages/db/interfaces";
import { eventIterator } from "@orpc/server";
import { EventPublisher } from "@orpc/server";
import { z } from "zod/v4";
import { SignInErrors, SignInStepInitialise, SignInStepFinalise, SignInTransmit, SignInReceive } from "./_flows/_types";
import agreements, { Initialise } from "./_flows/agreements";
import cancel from "./_flows/cancel";
import finalise from "./_flows/finalise";
import initialise from "./_flows/initialise";
import mailingLists from "./_flows/mailing-lists";
import personalToolsAndMaterials from "./_flows/personal-tools-and-materials";
import queue from "./_flows/queue";
import reasons from "./_flows/reasons";
import register from "./_flows/register";
import tools from "./_flows/tools";
import { InitialiseStep } from "./_flows/_steps";
import signOut from "./_flows/sign-out";

type UCardNumber = z.infer<typeof SignInStepInitialise>["ucard_number"];
type BaseKey = `${sign_in.LocationName}-${UCardNumber}`;

export const PUBLISHER = new EventPublisher<{
  [KeyT in BaseKey | `${BaseKey}-${z.infer<typeof SignInStepFinalise>["next"]}` | string]: KeyT extends BaseKey
    ? z.infer<typeof SignInStepInitialise>
    : z.infer<typeof SignInStepInitialise>;
}>();
export const SIGN_INS: {[K in BaseKey]: {
  AGREEMENT: {
    RECIEVE: z.infer<typeof Initialise>
  }
}} = {}

/**
 * This is analogous to a undirected acyclic graph
 * For the full connection logic see [this](https://www.mermaidchart.com/play#pako:eNptVE2P2jAQ_SujHNrtAZWwsLAc2iJaVXtopbbsoWr24CQDWCR21mNDEeK_d-x88FEuiEzePL_3PJNDlOkco2nU6_USlWm1lKtpogDsGkucgkLtnwqtN6cHsdfOTmEp_2KeqNC5LPQuWwtjYfHZYwDU5JBEz4QGMqGA5EqBVJAKwhy0gleHDoGssJhER-j14Lvm3w-g4tGfJHoiMLiSZNHwGdFLy-mBv5Fq5ODwH_DYAAfnjEPGfRMbDKagMnorSWolimJfCxMrg2xX2SuC7qT4vjWjtA097ILtYEG4W_PRp8ahb5y1hOBUjoas1jkIlbetgXTEnDPagNVALqXMyLSRyJVSyEKqFRRsja7YF1pD6mhf0zxwXF_Rdp3Bkau8zwoNW-S0-R3sMCVpMciwTRqMd8b_MQh3KWbCkQeC4GcqRFli_u6U_tgL7pxla8w2VF-ejyjmt3NdVq4gbfawMEIq72DucScHcdzg-6z7JwpieU-qcpz9C7zh-pjrX4zRBnQotodfzMjwlmlpr7yeuketyFZFvykMmKiTKr0OuPN3bPDVSR4pWLIQgxW9xy27prM44vuaY-xlD_q3Zceji0F6bO5cLr3OPewEJ8n6wzqchTS6cPvw6cBbl2IxBZ54xZLKoIk5RMgAnJ9NSeqtvVgH6Agn9a78CGs3y6zcYrDm98JQJTL82F3lpG26MW3x402fFHP5l9_057kwfmMbeMflPdBaVPxRMZhZFhYd_wHo9mxr)
 */
export const create = deskOrAdmin
  .route({ method: "GET", path: "/{ucard_number}" })
  .use(transaction)
  .input(InitialiseStep)
  .errors(SignInErrors)
  .handler(async function* (arg): AsyncGenerator<z.infer<typeof SignInStepFinalise>, {id: string}> {
    const {
      input,
      context: { tx },
      signal,
    } = arg;

    const user = await ensureUser({ ...input, db: tx });
    const $user = e.assert_exists(e.select(e.users.User, () => ({ filter_single: { id: user.id } })));
    const $location = e.assert_exists(e.select(e.sign_in.Location, () => ({ filter_single: { name: input.name } })));

    signal?.addEventListener("abort", async () => {
      await cancel({ ...arg, user, input: { ...input, type: "CANCEL" }, $user, $location });
    });

    const key = `${input.name}-${input.ucard_number}` as const;

    for await (const message of PUBLISHER.subscribe(`${input.name}-${input.ucard_number}`, { signal })) {
      const rxGen = PUBLISHER.subscribe(`${key}-${message.type}`, { signal });
      const rx = rxGen.next;
      let fn: () => AsyncGenerator<z.infer<typeof SignInTransmit>, z.infer<typeof SignInStepFinalise>, z.infer<typeof SignInReceive>> & {wait?: boolean};
      switch (message.type) {
        case "INITIALISE":
          fn = initialise.bind(undefined, { ...arg, user, input: message, $user, $location });
          break;
        case "QUEUE":
          fn = queue.bind(undefined, { ...arg, input: message, $user, $location });
          break;
        case "REGISTER":
          fn = register.bind(undefined, { ...arg, user, input: message, $user, $location });
          break;
        case "AGREEMENTS":
          fn = agreements.bind(undefined, { ...arg, user, input: message, $user, $location });
          break;
        case "REASON":
          fn = reasons.bind(undefined, { ...arg, user, input: message, $user, $location });
          break;
        case "TOOLS":
          fn = tools.bind(undefined, { ...arg, user, input: message, $user, $location });
          break;
        case "PERSONAL_TOOLS_AND_MATERIALS":
          fn = personalToolsAndMaterials.bind(undefined, { ...arg, user, input: message, $user, $location });
          break;
        case "MAILING_LISTS":
          fn = mailingLists.bind(undefined, { ...arg, user, input: message, $user, $location });
          break;
        case "FINALISE":
          fn = finalise.bind(undefined, { ...arg, user, input: message, $user, $location });
          break;
        case "CANCEL":
          fn = cancel.bind(undefined, { ...arg, user, input: message, $user, $location });
          break;
        case "SIGN_OUT":
          fn = signOut.bind(undefined, { ...arg, user, input: message, $user, $location })
          break
        default:
          exhaustiveGuard(message);
      }

      if (true) {
        rx.then(async (value) => await fn.next(value));
      } else {
        const result = await fn.next();
        if (result.done) {
          yield result.value;
        }
      }
      await fn.return();
    }
    return {id: ""}
  });

// avoid touching this, needed for bidirectional comms. Think of this as a send channel and above method is a recv channel (from client side)
export const send = deskOrAdmin
  .route({ method: "GET", path: "/{ucard_number}/send" })
  .input(eventIterator(InitialiseStep))
  .handler(async function* ({ input }) {
    for await (const message of input) {
      PUBLISHER.publish(`${message.name}-${message.ucard_number}`, message);
      yield;
    }
  });
