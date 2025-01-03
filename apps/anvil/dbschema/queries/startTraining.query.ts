// GENERATED by @edgedb/generate v0.5.6

import type {Executor} from "edgedb";

export type StartTrainingArgs = {
  readonly "id": string;
  readonly "user_id": string;
};

export type StartTrainingReturns = {
  "id": string;
  "sections": Array<{
    "type_name": string;
    "id": string;
    "index": number;
    "content": string;
    "name": string | null;
    "duration_": string | null;
    "type": ("SINGLE" | "MULTI") | null;
    "answers": Array<{
      "id": string;
      "content": string;
    }>;
  }>;
};

export function startTraining(client: Executor, args: StartTrainingArgs): Promise<StartTrainingReturns> {
  return client.queryRequiredSingle(`\
with training := (
    select assert_exists(training::Training filter .id = <uuid>$id)
),
user := (
    select assert_exists(users::User filter .id = <uuid>$user_id)
),
session := (
    insert training::Session {
        training := training,
        user := (
            user if exists training.rep
            else (
                user if user is users::Rep else <users::User>{}  # intentionally invalid value
            )
        ),
    }
    # return the current session if the user has one
    unless conflict on ((.user, .training)) # must be kept in-line with Session constraint
    else (select training::Session)
),
select session {
    id,
    sections := (
        select session.training.sections {
            # Section
            type_name := .__type__.name,
            id,
            index,
            content,
            name := [is training::Page].name,
            duration_ := duration_to_seconds([is training::Page].duration),
            type := [is training::Question].type,
            answers := [is training::Question].answers {
                id,
                content,
            },
        }
        filter .enabled and .index <= session.index
        order by .index
    )
};`, args);

}
