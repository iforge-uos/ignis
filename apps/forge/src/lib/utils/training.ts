// import { deserializeMd as deserializeMd_ } from "@udecode/plate-serializer-md";
// import { createPlateEditor } from "@ui/components/plate-ui/plate-editor";

import { sign_in, training } from "@packages/db/interfaces";
import { exhaustiveGuard } from ".";
import { Procedures } from "@/types/router";
import { iForgeEpoch } from "../constants";

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
  const name = location.toLowerCase() as Lowercase<training.LocationName>;
  switch (name) {
    case "mainspace":
      return "mainspace";
    case "heartspace":
      return "heartspace";
    case "george_porter":
      return "george-porter";
    default:
      exhaustiveGuard(name);
  }
};

type User = Procedures["users"]["profile"]["get"];
type Training = User["training"][number];

export interface TrainingWithRep extends Training {
  rep: Training | null;
}

// Training status types for better type safety and maintainability
export type TrainingStatusType =
  | "can-supervise"
  | "rep-complete"
  | "user-training-complete"
  | "fully-complete"
  | "online-complete"
  | "not-started";

export interface TrainingStatus {
  type: TrainingStatusType;
  label: string;
  nextStep: string | null;
  linkParams: { id: string } | null;
  className: string;
  variant: "info" | "outline" | "destructive";
}

/**
 * Finds the rep training for a given training within a user's training list
 */
export function findRepTraining(user: User, training: Training): Training | null {
  return training.rep ? user.training.find((t) => t.id === training.rep!.id) || null : null;
}

/**
 * Determines if a training is completed for a user
 */
export function isTrainingCompleted(user: User, training: Training): boolean {
  const onlineComplete = training["@created_at"];
  const inPersonComplete = training["@in_person_created_at"];

  // For non-rep users: training is complete if online is done AND (no in-person required OR in-person is done)
  if (user.__typename !== "users::Rep") {
    return Boolean(onlineComplete && (!training.in_person || inPersonComplete));
  }

  // For rep users: training is complete if they can supervise (rep supervision complete)
  // OR if it's just user training complete (both online and in-person if required)
  const repTraining = findRepTraining(user, training);
  const repSupervisionComplete = repTraining?.in_person
    ? repTraining?.["@in_person_created_at"]
    : repTraining?.["@created_at"];

  // Priority 1: Can supervise (rep supervision complete)
  if (repSupervisionComplete) {
    return true;
  }

  // Priority 2: User training complete (both online and in-person if required)
  return Boolean(onlineComplete && (!training.in_person || inPersonComplete));
}

export function isTrainingStarted(user: User, training: Training): boolean {
  const repTraining = findRepTraining(user, training);
  return Boolean(
    training["@created_at"] ||
      training["@in_person_created_at"] ||
      repTraining?.["@created_at"] ||
      repTraining?.["@in_person_created_at"],
  );
}

/**
 * Get completion date for sorting
 */
export function getCompletionDate(user: User, training: Training): Date {
  const onlineComplete = training["@created_at"];
  const inPersonComplete = training["@in_person_created_at"];
  const repTraining = findRepTraining(user, training);
  const repSupervisionComplete = repTraining?.in_person
    ? repTraining?.["@in_person_created_at"]
    : repTraining?.["@created_at"];

  // Use the most recent completion date
  if (repSupervisionComplete) return repSupervisionComplete;
  if (inPersonComplete) return inPersonComplete;
  if (onlineComplete) return onlineComplete;

  return iForgeEpoch;
}

/**
 * Get the most recent activity date for a training
 */
export function getLastActivityDate(user: User, training: Training): Date {
  const repTraining = findRepTraining(user, training);
  const dates = [
    training["@created_at"],
    training["@in_person_created_at"],
    repTraining?.["@created_at"],
    repTraining?.["@in_person_created_at"],
  ].filter((date): date is Date => Boolean(date));

  return dates.length > 0 ? new Date(Math.max(...dates.map((d) => new Date(d).getTime()))) : new Date(0);
}

/*
 * +===============+=========================================+
 * | Status        | Meaning                                 |
 * +===============+=========================================+
 * | Can           | Rep can supervise others                |
 * | supervise     |                                         |
 * +---------------+-----------------------------------------+
 * | Rep           | Rep completed training, needs in person |
 * | complete      | training completing if it exists        |
 * +---------------+-----------------------------------------+
 * | User training | Rep completed all user training         |
 * | complete      | (in person and online)                  |
 * +---------------+-----------------------------------------+
 * | Fully         | User completed all required training    |
 * | complete      | (in person and online)                  |
 * +---------------+-----------------------------------------+
 * | Online        | Only online portion completed, needs in |
 * | complete      | person training completing if it exists |
 * +---------------+-----------------------------------------+
 * | Not started   | No training completed yet               |
 * +===============+=========================================+
 *
 * +--- isRep parameter
 * |       +--- collapsed (no rep training is shown and rep training for the user training is collapsed into the user entry)
 * |       |     +--- training.in_person (training requires in-person)
 * |       |     |     +--- rep.in_person (supervision requires in-person)
 * |       |     |     |     +--- training["@created_at"] (online complete)
 * |       |     |     |     |    +--- training["@in_person_created_at"] (in-person complete)
 * |       |     |     |     |    |  +--- rep["@created_at"] (rep online complete)
 * |       |     |     |     |     |     |     +--- rep["@in_person_created_at"] (rep in-person complete)
 * v       v     v     v     v     v     v     v
 *                                                   |      Badge Result            |          Next Step
 * +=======+=====+=====+=====+=====+=====+=====+=====+==============================+============================+
 * |  N/A  |  no | N/A | N/A |  no | N/A | N/A | N/A | Not started                  | Start online               |
 * +-------+-----+-----+-----+-----+-----+-----+-----+------------------------------+----------------------------+
 * |  N/A  |  no | yes | N/A | yes |  no | N/A | N/A | Online complete              | Do in-person               |
 * +-------+-----+-----+-----+-----+-----+-----+-----+------------------------------+----------------------------+
 * | false |  no |  no | N/A | yes |  no | N/A | N/A | Fully complete               | N/A                        |
 * +-------+-----+-----+-----+-----+-----+-----+-----+------------------------------+----------------------------+
 * | false |  no | yes | N/A | yes | yes | N/A | N/A | Fully complete               | N/A                        |
 * +-------+-----+-----+-----+-----+-----+-----+-----+------------------------------+----------------------------+
 * |  true |  no |  no | N/A | yes |  no | yes | N/A | User online complete         | Do in-person or rep online |
 * +-------+-----+-----+-----+-----+-----+-----+-----+------------------------------+----------------------------+
 * |  true | yes | yes | yes | yes | yes | yes |  no | User and rep online complete | Do rep in-person           |
 * +-------+-----+-----+-----+-----+-----+-----+-----+------------------------------+----------------------------+
 * |  true | yes | yes |  no | yes | yes | yes | N/A | Can supervise                | N/A                        |
 * +-------+-----+-----+-----+-----+-----+-----+-----+------------------------------+----------------------------+
 * |  true | yes | yes | yes | yes | yes | yes | yes | Can supervise                | N/A                        |
 * +=======+=====+=====+=====+=====+=====+=====+=====+==============================+============================+
 *
 * Note: Online (rep) training is a prerequisite for (rep) in-person training.
 *       User online training is a prerequisite for online rep training
 *       States with in-person=yes but online=no are impossible.
 *       States with rep online=yes but online=no are impossible.
 */
export function getTrainingStatus(training: TrainingWithRep, isRep: boolean, collapseEntries: boolean): TrainingStatus {
  const onlineComplete = training["@created_at"];
  const inPersonComplete = training["@in_person_created_at"];
  const repSupervisionComplete = training.rep?.in_person
    ? training.rep?.["@in_person_created_at"]
    : training.rep?.["@created_at"];

  // Priority 1: Rep has completed supervision requirements - can now supervise others
  if (repSupervisionComplete) {
    return {
      type: "can-supervise",
      label: "Can supervise",
      nextStep: null,
      linkParams: null,
      className: "bg-green-100 text-green-800",
      variant: "info",
    };
  }

  // Priority 2: Rep has completed both user trainings but not rep supervision yet (non-collapsed view)
  if (
    isRep &&
    onlineComplete &&
    (!training.in_person || inPersonComplete) &&
    training.rep &&
    !repSupervisionComplete &&
    !collapseEntries
  ) {
    return {
      type: "rep-complete",
      label: "Rep complete",
      nextStep: "complete rep supervision training",
      linkParams: { id: training.rep.id },
      className: "bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors",
      variant: "info",
    };
  }

  // Priority 3: Rep completed all user training (collapsed view) - shows as "User training complete"
  if (isRep && onlineComplete && (!training.in_person || inPersonComplete) && collapseEntries) {
    return {
      type: "user-training-complete",
      label: "User training complete",
      nextStep: "complete rep supervision training",
      linkParams: training.rep ? { id: training.rep.id } : null,
      className: "bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors",
      variant: "info",
    };
  }

  // Priority 4: Both online and in-person training complete (regular users) OR online complete for trainings that don't require in-person
  if (!isRep && onlineComplete && (!training.in_person || inPersonComplete)) {
    return {
      type: "fully-complete",
      label: "Fully complete",
      nextStep: null,
      linkParams: null,
      className: "bg-green-100 text-green-800",
      variant: "info",
    };
  }

  // Priority 5: Only online training complete - need in-person if required
  if (onlineComplete && !inPersonComplete && training.in_person) {
    return {
      type: "online-complete",
      label: "Online complete",
      nextStep: "complete in-person training",
      linkParams: { id: training.id },
      className: "bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors",
      variant: "info",
    };
  }

  // Priority 6: No training completed yet
  return {
    type: "not-started",
    label: "Not started",
    nextStep: "start online training",
    linkParams: { id: training.id },
    className: "hover:bg-gray-100 hover:dark:text-black transition-all",
    variant: "outline",
  };
}

export function getTrainingCompletionStatus(
  user: User,
  training: Training,
) {
  return {
    isCompleted: isTrainingCompleted(user, training),
    isStarted: isTrainingStarted(user, training),
    completionDate: getCompletionDate(user, training),
    lastActivityDate: getLastActivityDate(user, training),
  };
}
