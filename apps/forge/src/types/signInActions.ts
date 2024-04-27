import React from "react";

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

export enum RegisterSteps {
  Step1 = "UCard Input",
  Step2 = "Register",
}

export enum EnqueueSteps {
  Step1 = "UCard Input",
  Step2 = "Enqueue",
}

export enum FlowType {
  SignIn = "SIGN_IN",
  SignOut = "SIGN_OUT",
  Register = "REGISTER",
  Enqueue = "ENQUEUE",
}

export interface StepComponentProps {
  onPrimary: () => void;
  onSecondary: () => void;
}

export interface FlowStepComponent extends React.FC<StepComponentProps> {}

export interface FlowConfiguration {
  [FlowType.SignIn]: Record<SignInSteps, FlowStepComponent>;
  [FlowType.SignOut]: Record<SignOutSteps, FlowStepComponent>;
  [FlowType.Register]: Record<RegisterSteps, FlowStepComponent>;
  [FlowType.Enqueue]: Record<EnqueueSteps, FlowStepComponent>;
}

// Define a type that can be either SignInSteps or SignOutSteps.
export type AnyStep = SignInSteps | SignOutSteps | RegisterSteps | EnqueueSteps;

export const flowTypeToPrintTable = (flowType: FlowType) => {
  switch (flowType) {
    case FlowType.SignIn:
      return "Sign In";
    case FlowType.SignOut:
      return "Sign Out";
    case FlowType.Register:
      return "Register";
    case FlowType.Enqueue:
      return "Enqueue";
  }
};
