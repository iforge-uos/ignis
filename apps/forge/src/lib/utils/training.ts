// import { deserializeMd as deserializeMd_ } from "@udecode/plate-serializer-md";
// import { createPlateEditor } from "@ui/components/plate-ui/plate-editor";

import { sign_in, training } from "@packages/db/interfaces";
import { exhaustiveGuard } from ".";

export function deserializeMd(content: string) {
  const editor = createPlateEditor();
  return deserializeMd_(editor, content);
}

const trainingKeysToTag = {
  compulsory: "Compulsory",
  in_person: "In-Person Training Required",
  enabled: "Enabled",
} as const;
export type TrainingTag = (typeof trainingKeysToTag)[keyof typeof trainingKeysToTag];
export type TrainingForTags = { [K in keyof typeof trainingKeysToTag]: boolean };

export const ALL_TAGS: readonly TrainingTag[] = Object.values(trainingKeysToTag);

export function trainingTags(training: TrainingForTags) {
  return Object.entries(training)
    .map(([key, value]) => (value ? trainingKeysToTag[key as keyof TrainingForTags] : ""))
    .filter(Boolean) as TrainingTag[];
}

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

export function serializeTrainingTags(badges_: TrainingTag[]): Required<TrainingForTags> {
  const badges = new Set(badges_);
  const training: Partial<Mutable<TrainingForTags>> = {};

  for (const [key, badge_] of Object.entries(trainingKeysToTag)) {
    if (badges.has(badge_)) {
      training[key as keyof TrainingForTags] = true;
    }
  }

  return training as Required<TrainingForTags>;
}

export const locationNameToCSSName = (location: training.LocationName | Lowercase<training.LocationName>) => {
  const name = location.toLowerCase() as Lowercase<training.LocationName>
  switch (name) {
    case "mainspace":
      return "mainspace";
    case "heartspace":
      return "heartspace";
    case "george_porter":
      return "george-porter";
    default:
      exhaustiveGuard(name)
  }
};
