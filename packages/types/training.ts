import type { training } from "@dbschema/interfaces";

export type TrainingPageInteraction = {
  type_name: "training::TrainingPage";
  duration_?: string; // duration in seconds as a float (but yes it really is a string)
} & Omit<training.TrainingPage, "duration">;
export type QuestionInteraction = {
  type_name: "training::Question";
  answers: { id: string; content: string; description?: string }[];
} & Omit<training.Question, "answers">;
export type WrongAnswers = {
  type_name: "training::WrongAnswers";
  answers: { id: string }[];
};

export type InteractionResponse = TrainingPageInteraction | QuestionInteraction | WrongAnswers | undefined;

/** {id -> status} The text shown to a user on the button for the course */
export type UserTrainingStatus = "Complete" | "Resume" | "Retake";
export type UserTrainingStatuses = { [K in string]: "Complete" | "Resume" | "Retake" };

export type Location = training.TrainingLocation;

export type PartialTraining = {
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
};

export type PartialTrainingWithStatus = Omit<PartialTraining, "rep"> & {
  status: UserTrainingStatus;
  rep: {
    id: string;
    description: string;
    status: UserTrainingStatus;
  } | null;
};

export type Training = PartialTraining & {
  sections?: (TrainingPageInteraction | QuestionInteraction)[];
};
