import type { training } from "@dbschema/interfaces";

export interface TrainingPageInteraction extends Omit<training.TrainingPage, "duration"> {
  type_name: "training::TrainingPage";
  duration_?: string; // duration in seconds as a float (but yes it really is a string)
}
export interface QuestionInteraction extends Omit<training.Question, "answers"> {
  type_name: "training::Question";
  answers: { id: string; content: string; description?: string }[];
}
export type WrongAnswers = {
  type_name: "training::WrongAnswers";
  answers: { id: string }[];
};

export type InteractionResponse = TrainingPageInteraction | QuestionInteraction | WrongAnswers | undefined;

/** {id -> status} The text shown to a user on the button for the course */
export type UserTrainingStatus = "Start" | "Resume" | "Retake";
export type UserTrainingStatuses = Map<string, UserTrainingStatus>;

export type Location = training.TrainingLocation;

export interface AllTraining {
  id: string;
  rep: {
    id: string;
    description: string;
  };
  name: string;
  description: string;
  locations: Location[];
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
  locations: Location[];
  created_at: Date;
  updated_at: Date;
  in_person: boolean;
  // icon_url: string;
  enabled: boolean;
}

export interface PartialTrainingWithStatus extends PartialTraining {
  status: UserTrainingStatus;
  rep: {
    id: string;
    description: string;
    status: UserTrainingStatus;
  } | null;
}

export type Section = TrainingPageInteraction | QuestionInteraction;

export interface Training extends PartialTraining {
  sections?: Section[];
}
