import { deskOrAdmin, transaction } from "@/router";
import { exhaustiveGuard } from "@/utils/base";
import { ensureUser } from "@/utils/sign-in";
import e from "@db/edgeql-js";
import { eventIterator } from "@orpc/server";
import { EventPublisher } from "@orpc/server";
import { z } from "zod/v4";
import { BaseInputStep, SignInErrors, SignInStepInput, type SignInStepOutput } from "./_flows/_types";
import agreements from "./_flows/agreements";
import cancel from "./_flows/cancel";
import finalise from "./_flows/finalise";
import initialise from "./_flows/initialise";
import mailingLists from "./_flows/mailing-lists";
import personalToolsAndMaterials from "./_flows/personal-tools-and-materials";
import queue from "./_flows/queue";
import reasons from "./_flows/reasons";
import register from "./_flows/register";
import tools from "./_flows/tools";

const publisher = new EventPublisher<Record<string, z.infer<typeof SignInStepInput>>>();

/**
 * This is analogous to a undirected acyclic graph
 * For the full connection logic see [this](https://www.mermaidchart.com/play#pako:eNptVE2P2jAQ_SujHNrtAZWwsLAc2iJaVXtopbbsoWr24CQDWCR21mNDEeK_d-x88FEuiEzePL_3PJNDlOkco2nU6_USlWm1lKtpogDsGkucgkLtnwqtN6cHsdfOTmEp_2KeqNC5LPQuWwtjYfHZYwDU5JBEz4QGMqGA5EqBVJAKwhy0gleHDoGssJhER-j14Lvm3w-g4tGfJHoiMLiSZNHwGdFLy-mBv5Fq5ODwH_DYAAfnjEPGfRMbDKagMnorSWolimJfCxMrg2xX2SuC7qT4vjWjtA097ILtYEG4W_PRp8ahb5y1hOBUjoas1jkIlbetgXTEnDPagNVALqXMyLSRyJVSyEKqFRRsja7YF1pD6mhf0zxwXF_Rdp3Bkau8zwoNW-S0-R3sMCVpMciwTRqMd8b_MQh3KWbCkQeC4GcqRFli_u6U_tgL7pxla8w2VF-ejyjmt3NdVq4gbfawMEIq72DucScHcdzg-6z7JwpieU-qcpz9C7zh-pjrX4zRBnQotodfzMjwlmlpr7yeuketyFZFvykMmKiTKr0OuPN3bPDVSR4pWLIQgxW9xy27prM44vuaY-xlD_q3Zceji0F6bO5cLr3OPewEJ8n6wzqchTS6cPvw6cBbl2IxBZ54xZLKoIk5RMgAnJ9NSeqtvVgH6Agn9a78CGs3y6zcYrDm98JQJTL82F3lpG26MW3x402fFHP5l9_057kwfmMbeMflPdBaVPxRMZhZFhYd_wHo9mxr)
 */
export const create = deskOrAdmin
  .route({ method: "GET", path: "/{ucard_number}" })
  .use(transaction)
  .input(BaseInputStep)
  .errors(SignInErrors)
  .handler(async function* (arg): AsyncGenerator<SignInStepOutput> {
    const {
      input,
      context: { tx },
      signal,
    } = arg;

    const user = await ensureUser({ ...input, db: tx });
    const $user = e.assert_exists(e.select(e.users.User, () => ({ filter_single: { id: user.id } })));
    const $location = e.assert_exists(e.select(e.sign_in.Location, () => ({ filter_single: { name: input.name } })));

    signal?.addEventListener("abort", async () => {
      await cancel({ ...arg, input: { ...input, type: "CANCEL" }, user, $user, $location });
    });

    for await (const message of publisher.subscribe(input.ucard_number, { signal })) {
      switch (message.type) {
        case "INITIALISE":
          yield await initialise({ ...arg, user, input: message, $user, $location });
          break;
        case "QUEUE":
          yield await queue({ ...arg, input: message, $user, $location });
          break;
        case "REGISTER":
          yield await register({ ...arg, user, input: message, $user, $location });
          break;
        case "AGREEMENTS":
          yield await agreements({ ...arg, user, input: message, $user, $location });
          break;
        case "REASON":
          yield await reasons({ ...arg, user, input: message, $user, $location });
          break;
        case "TOOLS":
          yield await tools({ ...arg, user, input: message, $user, $location });
          break;
        case "PERSONAL_TOOLS_AND_MATERIALS":
          yield await personalToolsAndMaterials({ ...arg, user, input: message, $user, $location });
          break;
        case "MAILING_LISTS":
          yield await mailingLists({ ...arg, user, input: message, $user, $location });
          break;
        case "FINALISE":
          yield await finalise({ ...arg, user, input: message, $user, $location });
          break;
        case "CANCEL":
          yield await cancel({ ...arg, user, input: message, $user, $location });
          break;
        default:
          exhaustiveGuard(message);
      }
    }
  });

// avoid touching this, needed for bidirectional comms. Think of this as a send channel and above method is a recv channel (from client side)
export const send = deskOrAdmin
  .route({ method: "GET", path: "/{ucard_number}/send" })
  .input(eventIterator(SignInStepInput))
  .handler(async function* ({ input }) {
    for await (const message of input) {
      publisher.publish(message.ucard_number, message);
      yield;
    }
  });
