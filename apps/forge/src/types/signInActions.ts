import React from "react";
import { StepType } from "@/api/locations/$name/sign-in/_flows/_steps";
import z from "zod";
import type { InitialiseToTransmitMap } from "@/routes/test/$name.$ucard_number";

export enum SignInSteps {
  Step1 = "UCard Input",
  Step2 = "Fetching Training",
  Step3 = "Reason Input",
  Step4 = "Sign In",
}

export enum SignOutSteps {
  Step1 = "UCard Input",
  Step2 = "Sign Out",
}

export enum EnqueueSteps {
  Step1 = "UCard Input",
  Step2 = "Enqueue",
}

export enum FlowType {
  SignIn = "SIGN_IN",
  SignOut = "SIGN_OUT",
  Enqueue = "ENQUEUE",
}

export interface StepComponentProps {
  onPrimary: () => void;
  onSecondary: () => void;
}

export interface FlowStepComponent<StepT extends z.infer<typeof StepType>> extends React.FC<StepComponentProps & {data: InitialiseToTransmitMap[StepT]}> {}

export interface FlowConfiguration {
  [FlowType.SignIn]: Record<SignInSteps, FlowStepComponent>;
  [FlowType.SignOut]: Record<SignOutSteps, FlowStepComponent>;
  [FlowType.Enqueue]: Record<EnqueueSteps, FlowStepComponent>;
}

// Define a type that can be either SignInSteps or SignOutSteps.
export type AnyStep = SignInSteps | SignOutSteps | EnqueueSteps;

export const flowTypeToPrintTable = (flowType: FlowType) => {
  switch (flowType) {
    case FlowType.SignIn:
      return "Sign In";
    case FlowType.SignOut:
      return "Sign Out";
    case FlowType.Enqueue:
      return "Enqueue";
  }
};
