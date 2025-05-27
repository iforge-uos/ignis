import EventEmitter, { on } from "node:events";
import { deskOrAdmin, transaction } from "@/router";
import { exhaustiveGuard } from "@/utils/base";
import { ensureUser } from "@/utils/sign-in";
import e from "@db/edgeql-js";
import { eventIterator } from "@orpc/server";
import { z } from "zod/v4";
import { BaseInputStep, SignInErrors, SignInStepInput, SignInStepOutput } from "./_flows/_types";
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

const ee = new EventEmitter<{ [KeyT in string]: [z.infer<typeof SignInStepInput>] }>();

export const signIn = deskOrAdmin
  .route({ method: "POST", path: "/{ucard_number}" })
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

    for await (const [_message] of on(ee, input.ucard_number, { signal })) {
      const message = _message as z.infer<typeof SignInStepInput>; // this is safe as the channel below has already validated
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
export const signInSend = deskOrAdmin
  .route({ method: "POST", path: "/{ucard_number}/send" })
  .input(eventIterator(SignInStepInput))
  .handler(async function* ({ input }) {
    for await (const message of input) {
      ee.emit(message.ucard_number, message);
      yield;
    }
  });
