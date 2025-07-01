import { auth } from "@/orpc";
import { UserShape } from "@/lib/utils/queries";
import e from "@packages/db/edgeql-js";
import { z } from "zod/v4";

export const search = auth
  .route({ method: "GET", path: "/search" })
  .input(
    z.object({
      query: z.string().min(1),
      limit: z.number().min(1).max(100).default(1),
    }),
  )
  .handler(
    async ({ input: { query, limit }, context: { db } }) =>
      await e
        .select(
          e.select(e.users.User, (user) => ({
            similarity: e.ext.pg_trgm.word_similarity(
              query,
              /*
             "000" ++ to_str(.ucard_number) ++ " " ++
             .username ++ " " ++
             .email ++ " " ++
             .display_name

             Good luck
             */
              e.op(
                e.op(
                  e.op(
                    e.op(
                      e.op(e.op(e.op("000", "++", e.to_str(user.ucard_number)), "++", " "), "++", user.username),
                      "++",
                      " ",
                    ),
                    "++",
                    user.email,
                  ),
                  "++",
                  " ",
                ),
                "++",
                user.display_name,
              ),
            ),
          })),
          (user) => ({
            ...UserShape(user),
            filter: e.op(user.similarity, ">", 0.3),
            order_by: {
              expression: user.similarity,
              direction: e.DESC,
            },
            limit,
          }),
        )
        .run(db),
  );
