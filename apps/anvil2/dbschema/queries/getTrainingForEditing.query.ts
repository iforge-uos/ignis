// GENERATED by @edgedb/generate v0.5.6

import type {Duration, Executor} from "edgedb";

export type GetTrainingForEditingArgs = {
  readonly "id": string;
};

export type GetTrainingForEditingReturns = {
  "sections": Array<{
    "type_name": string;
    "name": string | null;
    "duration_": string | null;
    "answers": Array<{
      "id": string;
      "content": string;
      "description": string | null;
    }>;
    "content": string;
    "enabled": boolean;
    "id": string;
    "index": number;
  }>;
  "compulsory": boolean;
  "description": string;
  "updated_at": Date;
  "id": string;
  "created_at": Date;
  "name": string;
  "enabled": boolean;
  "expires_after": Duration | null;
  "in_person": boolean;
  "locations": Array<("MAINSPACE" | "HEARTSPACE" | "GEORGE_PORTER")>;
  "training_lockout": Duration | null;
  "icon_url": string | null;
  "pages": Array<{
    "index": number;
    "enabled": boolean;
    "content": string;
    "id": string;
    "duration": Duration | null;
    "name": string;
  }>;
  "questions": Array<{
    "index": number;
    "enabled": boolean;
    "content": string;
    "id": string;
    "type": ("SINGLE" | "MULTI");
  }>;
  "rep": {
    "compulsory": boolean;
    "description": string;
    "updated_at": Date;
    "id": string;
    "created_at": Date;
    "name": string;
    "enabled": boolean;
    "expires_after": Duration | null;
    "in_person": boolean;
    "locations": Array<("MAINSPACE" | "HEARTSPACE" | "GEORGE_PORTER")>;
    "training_lockout": Duration | null;
    "icon_url": string | null;
  } | null;
};

export function getTrainingForEditing(client: Executor, args: GetTrainingForEditingArgs): Promise<GetTrainingForEditingReturns> {
  return client.queryRequiredSingle(`\
select assert_exists(
    training::Training {
        **,
        sections: {
            *,
            type_name := .__type__.name,
            [is training::TrainingPage].name,
            duration_ := duration_to_seconds([is training::TrainingPage].duration),
            answers := [is training::Question].answers {
                id,
                content,
                description,
            },
        }
    }
    filter .id = <uuid>$id
)`, args);

}