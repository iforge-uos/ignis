import { CardNotFound, DuplicateUserName } from "@iforge-uos/pharos-edi-client";
import { ErrorMap } from "@orpc/server";
import z from "zod";
import { deskOrAdmin } from "@/orpc";
import client from "@/shop";

const Errors = {
  NOT_FOUND: {
    data: z.object({ username: z.string() }),
  },
  CONFLICT: {
    data: z.object({ username: z.string() }),
  },
} as const satisfies ErrorMap;

// TODO decide if this uses ucard or username
export const get = deskOrAdmin
  .route({ path: "/{username}" })
  .errors(Errors)
  .input(z.object({ username: z.string() }))
  .handler(async ({ input: { username }, errors }) => {
    // console.log(client)
    // console.trace("Ayo")
    try {
      const [details, costCenters] = await Promise.all([
        client.getUserDetails(username),
        client.getCostCenters(username),
      ]);
      return {
        balance: Number.parseFloat(details.balance as any), // I don't know what the code is doing its definitely a number when I test it in just the lib
        cost_centers: costCenters,
      };
    } catch (error) {
      if (error instanceof CardNotFound) {
        throw errors.NOT_FOUND({ message: "User not found with username/ucard", data: { username: error.cardId } });
      }
      throw error;
    }
  });

// Is this even useful cause I think they need they need balance to be added
export const insert = deskOrAdmin
  .route({ method: "POST", path: "/" })
  .errors(Errors)
  .input(
    z.object({
      username: z.string(),
      last_name: z.string(),
      first_name: z.string(),
      ucard_number: z.string(), // with issuer
      email: z.string(),
    }),
  )
  .handler(async ({ input, errors }) => {
    try {
      return await client.insertUser(input);
    } catch (error) {
      if (error instanceof DuplicateUserName) {
        throw errors.CONFLICT({ message: "User already exists", data: { username: error.userName } });
      }
    }
  });

export const usersRouter = deskOrAdmin.prefix("/users").router({
  get,
  insert,
});
