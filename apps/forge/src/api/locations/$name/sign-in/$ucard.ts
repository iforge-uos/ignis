import { EventPublisher, eventIterator } from "@orpc/server";
import e from "@packages/db/edgeql-js";
import { sign_in } from "@packages/db/interfaces";
import * as Sentry from "@sentry/tanstackstart-react";
import { logger } from "@sentry/tanstackstart-react";
import { Client, Duration, Executor } from "gel";
import { Transaction } from "gel/dist/transaction";
import * as z from "zod";
import { exhaustiveGuard } from "@/lib/utils";
import { ensureUser } from "@/lib/utils/queries";
import { deskOrAdmin, transaction } from "@/orpc";
import { InitialiseStep, SIGN_INS, StepType } from "./_flows/_steps";
import { Errors, Finalise, Initialise, Receive, Return, Transmit } from "./_flows/_types";

type UCardNumber = z.infer<typeof Initialise>["ucard_number"];
export type BaseKey = `${sign_in.LocationName}-${UCardNumber}`;

// we have to use just one channel here (I don't think this is correct)
export const PUBLISHER = new EventPublisher<{
  [x: `${BaseKey}-INITIALISE`]: z.infer<typeof Initialise>;
  [x: `${BaseKey}-RECEIVE`]: z.infer<typeof Receive>;
}>();

type FnReturn = Return<z.infer<typeof Transmit>, z.infer<typeof Finalise>, z.infer<typeof Receive>>;

import agreements from "./_flows/agreements";
import cancel from "./_flows/cancel";
import finalise from "./_flows/finalise";
import initialiseFlow from "./_flows/initialise";
import mailingLists from "./_flows/mailing-lists";
import personalToolsAndMaterials from "./_flows/personal-tools-and-materials";
import queue from "./_flows/queue";
import reasons from "./_flows/reasons";
import signOut from "./_flows/sign-out";
import tools from "./_flows/tools";

const HANDLERS: { [K in z.infer<typeof StepType>]: (...args: any) => FnReturn } = {
  INITIALISE: initialiseFlow,
  QUEUE: queue,
  // REGISTER: register,  // TODO you might need this IDK, it'd be another noop
  AGREEMENTS: agreements,
  REASON: reasons,
  TOOLS: tools,
  PERSONAL_TOOLS_AND_MATERIALS: personalToolsAndMaterials,
  MAILING_LISTS: mailingLists,
  FINALISE: finalise,
  CANCEL: cancel,
  SIGN_OUT: signOut,
} as const;

/**
 * This is analogous to a undirected acyclic graph
 * For the full connection logic see [this](https://www.mermaidchart.com/play#pako:eNptVE2P2jAQ_SujHNrtAZWwsLAc2iJaVXtopbbsoWr24CQDWCR21mNDEeK_d-x88FEuiEzePL_3PJNDlOkco2nU6_USlWm1lKtpogDsGkucgkLtnwqtN6cHsdfOTmEp_2KeqNC5LPQuWwtjYfHZYwDU5JBEz4QGMqGA5EqBVJAKwhy0gleHDoGssJhER-j14Lvm3w-g4tGfJHoiMLiSZNHwGdFLy-mBv5Fq5ODwH_DYAAtxjEPGfRMbDKagMnorSWolimJfCxMrg2xX2SuC7qT4vjWjtA097ILtYEG4W_PRp8ahb5y1hOBUjoas1jkIlbetgXTEnDPagNVALqXMyLSRyJVSyEKqFRRsja7YF1pD6mhf0zxwXF_Rdp3Bkau8zwoNW-S0-R3sMCVpMciwTRqMd8b_MQh3KWbCkQeC4GcqRFli_u6U_tgL7pxla8w2VF-ejyjmt3NdVq4gbfawMEIq72DucScHcdzg-6z7JwpieU-qcpz9C7zh-pjrX4zRBnQotodfzMjwlmlpr7yeuketyFZFvykMmKiTKr0OuPN3bPDVSR4pWLIQgxW9xy27prM44vuaY-xlD_q3Zceji0F6bO5cLr3OPewEJ8n6wzqchTS6cPvw6cBbl2IxBZ54xZLKoIk5RMgAnJ9NSeqtvVgH6Agn9a78CGs3y6zcYrDm98JQJTL82F3lpG26MW3x402fFHP5l9_057kwfmMbeMflPdBaVPxRMZhZFhYd_wHo9mxr)
 */
export const flow = deskOrAdmin
  .route({ method: "GET", path: "/{ucard_number}", tags: ["hidden"] })
  // @ts-ignore  // the middleware doesn't work for async generators but the types are useful
  .use(transaction)
  .input(InitialiseStep)
  .errors(Errors)
  .handler(async function* (arg): AsyncGenerator<
    z.infer<typeof Transmit> | z.infer<typeof Finalise>,
    { id: string } | undefined
  > {
    const {
      input,
      context: { db },
      signal,
    } = arg;
    logger.info(logger.fmt`Starting sign in flow for ${input.ucard_number.slice(3)}`);

    const key = `${input.name}-${input.ucard_number}` as const;
    const initialise = PUBLISHER.subscribe(`${key}-INITIALISE`, { signal }); // Do these as soon as possible to avoid any potential race conditions
    const rx = PUBLISHER.subscribe(`${key}-RECEIVE`, { signal });

    // manually setup the transaction
    const { txn, cleanupTx } = await getTx(db);
    arg.context.tx = txn;

    try {
      const user = await ensureUser({ ...input, tx: arg.context.tx });
      const $user = e.assert_exists(e.select(e.users.User, () => ({ filter_single: { id: user.id } })));
      const $location = e.assert_exists(e.select(e.sign_in.Location, () => ({ filter_single: { name: input.name } })));

      signal?.addEventListener("abort", async () => {
        console.log("Got a cancel");
        await cancel({ ...arg, user, input: { ...input, type: "CANCEL" }, $user, $location }).next();
      });

      for await (const message of initialise) {
        console.log("Getting an init message", message);
        // lifecycle is:
        // 1. INITIALISE (client) - tells us which function to call and any relevant data (there isn't normally any but future proofing lol)
        // 2. TRANSMIT (server) - send the client the info to display on the frontend
        // 3. RECEIVE (client) - client sends back any data for validation
        // 4. FINALISE (server) - tells the client what the next step is and any relevant data (same statement applies as INITIALISE)
        const handler = HANDLERS[message.type];
        const store = SIGN_INS[key][message.type];
        const tx: FnReturn = handler({ ...arg, user, $user, $location, input: message });

        // store the values for use in `finalise`. Has added benefit of the client being able to replay previous values and updates appropriately (refetches things)
        store.INITIALISE = message;

        const { value: transmit } = (await tx.next()) as { value: z.infer<typeof Transmit> };
        transmit.type = message.type; // this isn't set in the yield directly for convenience
        yield transmit;

        const { value: receive } = await rx.next();
        store.RECEIVE = receive; // cache for the same reason

        const { value: fin, done } = (await tx.next(receive)) as { value: z.infer<typeof Finalise>; done: true };
        if (!done) exhaustiveGuard(message.type as never);
        if (fin.next === undefined) {
          delete SIGN_INS[key]; // avoid leaking memory :)
          if (fin.type === "FINALISE") {
            return fin.sign_in; // close the stream
          }
          return;
        }

        yield fin;
      }

      throw new Error("unreachable, PUBLISHER should always yield");
    } catch (e) {
      console.error(e);
      Sentry.captureException(e);
      throw e;
    } finally {
      cleanupTx(undefined);
    }
  });

export const initialise = deskOrAdmin
  .route({ method: "GET", path: "/{ucard_number}/initialise", tags: ["hidden"] })
  .input(eventIterator(Initialise))
  .handler(async function* ({ input }) {
    for await (const message of input) {
      PUBLISHER.publish(`${message.name}-${message.ucard_number}-INITIALISE`, message);
      yield;
    }
  });

export const receive = deskOrAdmin
  .route({ method: "GET", path: "/{ucard_number}/receive", tags: ["hidden"] })
  .input(eventIterator(Receive))
  .handler(async function* ({ input }) {
    for await (const message of input) {
      PUBLISHER.publish(`${message.name}-${message.ucard_number}-RECEIVE`, message);
      yield;
    }
  });

async function getTx(db: Executor) {
  let resolveTx: (x: Transaction) => void;
  let cleanupTx: (x: undefined) => void;
  // biome-ignore lint/suspicious/noAssignInExpressions: it's cool
  const getTx = new Promise<Transaction>((resolve) => (resolveTx = resolve));
  // biome-ignore lint/suspicious/noAssignInExpressions: it's also cool
  const blocker = new Promise<undefined>((resolve) => (cleanupTx = resolve));
  (db as Client)
    .withConfig({ session_idle_transaction_timeout: Duration.from({ hours: 24 }) }) // otherwise we get an IdleTransactionTimeoutError nearly instantly
    .transaction(async (tx) => {
      resolveTx(tx);
      await blocker;
    });
  return {
    txn: await getTx,
    // @ts-ignore
    cleanupTx,
  };
}
// I don't think this is required
// export const backtrack = deskOrAdmin
//   .route({ method: "GET", path: "/{ucard_number}/backtrack", tags: ["hidden"] })
//   .input(eventIterator(InitialiseStep.extend({type: StepType})))
//   .handler(async function* ({ input }) {
//     for await (const message of input) {
//     const flow = SIGN_INS[`${message.name}-${message.ucard_number}`]
//     const maybePrevious = flow[message.type]
//     if (Object.keys(maybePrevious).length === 1) { // they INITIALISE
//       yield maybePrevious;
//     }
//     yield
//     }
//   });
