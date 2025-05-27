import { deskOrAdmin, transaction } from "@/router";
import { exhaustiveGuard } from "@/utils/base";
import { ensureUser } from "@/utils/sign-in";
import e from "@db/edgeql-js";
import { SignInErrors, SignInStepInput } from "./_flows/_types";
import { z } from "zod/v4";
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

export const signIn = deskOrAdmin
  .route({ method: "POST", path: "/{ucard_number}" })
  // .use(transaction)
  .input(SignInStepInput)
  .output(z.any())
  .errors(SignInErrors)
  .handler(async (arg) => {
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

    switch (input.type) {
      case "INITIALISE":
        return await initialise({ ...arg, user, input, $user, $location });
      case "QUEUE":
        return await queue({ ...arg, user, input, $user, $location });
      case "REGISTER":
        return await register({ ...arg, user, input, $user, $location });
      case "AGREEMENTS":
        return await agreements({ ...arg, user, input, $user, $location });
      case "REASON":
        return await reasons({ ...arg, user, input, $user, $location });
      case "TOOLS":
        return await tools({ ...arg, user, input, $user, $location });
      case "PERSONAL_TOOLS_AND_MATERIALS":
        return await personalToolsAndMaterials({ ...arg, user, input, $user, $location });
      case "FINALISE":
        return await finalise({ ...arg, user, input, $user, $location });
      case "CANCEL":
        return await cancel({ ...arg, user, input, $user, $location });
      case "MAILING_LISTS":
        return await mailingLists({ ...arg, user, input, $user, $location });
      default:
        exhaustiveGuard(input);
    }
  })
