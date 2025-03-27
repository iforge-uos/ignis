import type { training } from "@dbschema/interfaces";
import { Temporal } from "@js-temporal/polyfill";
import { Duration } from "gel";

export interface PageInteraction extends Omit<training.Page, "duration"> {
  type_name: "training::TrainingPage";
  duration?: Temporal.Duration | Duration; // duration in seconds as a float (but yes it really is a string)
}
export interface QuestionInteraction extends Omit<training.Question, "answers"> {
  type_name: "training::Question";
  answers: { id: string; content: string; description?: string }[];
}
export type WrongAnswers = {
  type_name: "training::WrongAnswers";
  answers: { id: string }[];
};

export type InteractionResponse = PageInteraction | QuestionInteraction | WrongAnswers | undefined;

/** {id -> status} The text shown to a user on the button for the course */
export type UserTrainingStatus = "Start" | "Resume" | "Retake";
export type UserTrainingStatuses = Map<string, UserTrainingStatus>;

export type LocationName = training.LocationName;

export interface AllTraining {
  id: string;
  rep: {
    id: string;
    description: string;
  };
  name: string;
  description: string;
  locations: LocationName[];
}

export interface PartialTraining {
  name: string;
  id: string;
  description: string;
  compulsory: boolean;
  rep: {
    id: string;
    description: string;
  } | null;
  locations: LocationName[];
  created_at: Date;
  updated_at: Date;
  in_person: boolean;
  icon_url?: string | null;
  enabled?: boolean | null;
}

export interface PartialTrainingWithStatus extends PartialTraining {
  status: UserTrainingStatus;
  rep: {
    id: string;
    description: string;
    status: UserTrainingStatus;
  } | null;
}

export type Section = PageInteraction | QuestionInteraction;

export interface Training extends PartialTraining {
  sections?: Section[];
}
