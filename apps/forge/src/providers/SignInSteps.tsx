import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import React, { createContext, use, useCallback, useEffect, useRef } from "react";
import { activeLocationAtom } from "@/atoms/signInAppAtoms";
import { orpc } from "@/lib/orpc";
import {
  ReceiveReturn,
  RMCommon,
  StepToReceiveMap,
  StepToTransmitMap,
  StepType,
  Transmit,
} from "@/routes/_authenticated/_reponly/sign-in.$location/$ucard_number";

export interface SignInSteps<StepT extends StepType = StepType> {
  transmit: RMCommon<StepToTransmitMap[StepT]>;
  _setTransmit: React.Dispatch<React.SetStateAction<Transmit | undefined>>;
  // finalise: RMCommon<StepToFinaliseMap[StepT]> | null; // non-null after continue()
  // callback: (arg0: RMCommon<StepToReceiveMap[StepT]>) => Promise<ReceiveReturn<StepT>>;
  _continue: TransmitFn<StepT>;

  /** Make the next step button enabled */
  canContinue: boolean;
  setCanContinue: (arg0: boolean) => void;

  /** Set the steps in the sign-in flow */
  _setSteps: React.Dispatch<React.SetStateAction<StepType[]>>;
  /** Focus the next step button */
  focusNextStep: () => void;

  /** The callback for sending data to the server */
  finalise: (() => Promise<void>) | undefined;
  _setFinalise: React.Dispatch<React.SetStateAction<() => Promise<void>>>;
}

const SignInStepsContext = createContext<SignInSteps<StepType> | null>(null);

type TransmitFn<StepT extends StepType> = (data: RMCommon<StepToReceiveMap[StepT]>) => Promise<ReceiveReturn<StepT>>;

export function useSignIn<StepT extends StepType>(
  callback: (transmit: TransmitFn<StepT>) => Promise<void>,
): SignInSteps<StepT> {
  const ctx = use(SignInStepsContext);
  const queryClient = useQueryClient();
  const activeLocation = useAtomValue(activeLocationAtom);
  const navigate = useNavigate();

  if (!ctx) throw new Error("useSignIn must be used in SignInStepsContext");

  const { _continue, _setSteps, _setFinalise, _setTransmit } = ctx;

  // Keep latest callback in a ref so the effect below never needs it as a dep
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  // Keep latest _continue in a ref so the effect below never needs it as a dep.
  // _continue is bound inline in the parent (receive.bind(...)) and is a new reference
  // on every render, so adding it to the effect deps would cause an infinite loop.
  const continueRef = useRef(_continue);
  continueRef.current = _continue;

  // cheeky bit of dependency injection
  useEffect(() => {
    if (!callbackRef.current) return; // SignInNav passes undefined — skip

    const inner = async () => {
      let nextStep: StepType | undefined;

      await callbackRef.current(async (data: Parameters<TransmitFn<StepT>>[0]) => {
        const ret = await continueRef.current(data);
        nextStep = ret.data?.next;
        return ret as ReceiveReturn<StepT>;
      });

      if (nextStep === undefined) {
        await navigate({ to: "/sign-in/$location/dashboard", params: { location: activeLocation } });
      } else {
        _setTransmit(undefined);
        _setSteps((prevSteps) => [...prevSteps, nextStep!]);
      }
    };

    // should only *not* be hit inside of SignInNav
    _setFinalise(
      (
        _arg0, // wrap the function to avoid react thinking the function is meant to be called creating a Promise
      ) => inner,
    );
  }, [_setSteps, _setFinalise]);

  return ctx as unknown as SignInSteps<StepT>;
}

export default ({
  children,
  transmit,
  _setTransmit,
  _continue,
  canContinue,
  setCanContinue,
  focusNextStep,
  finalise,
  _setFinalise,
  _setSteps,
}: SignInSteps & {} & React.FragmentProps) => {
  return (
    <SignInStepsContext
      value={{
        transmit,
        _setTransmit,
        _continue,
        finalise,
        _setFinalise,
        canContinue,
        setCanContinue,
        focusNextStep,
        _setSteps,
      }}
    >
      {children}
    </SignInStepsContext>
  );
};
