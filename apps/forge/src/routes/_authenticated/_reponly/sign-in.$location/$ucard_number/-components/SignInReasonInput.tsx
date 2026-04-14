import type { PartialReason } from "@packages/types/sign_in";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@packages/ui/components/alert-dialog";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@packages/ui/components/input-group";
import { useMutation, useQuery } from "@tanstack/react-query";
import Fuse from "fuse.js";
import { useAtom } from "jotai";
import { Search } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { sessionSignInReasonAtom } from "@/atoms/signInAppAtoms";
import { AgreementViewer } from "@/components/sign-in/AgreementViewer";
import { usePromiseDialog } from "@/hooks/usePromiseDialog";
import { Category } from "@/icons/SignInReason";
import { orpc } from "@/lib/orpc";
import { useSignIn } from "@/providers/SignInSteps";
import { FlowStepComponent } from "@/types/signInActions";
import { SignInReason } from "./SignInReason";

type AgreementToSign = {
  id: string;
  name: string;
  content: string;
  version?: number;
  updated_at?: { epochMilliseconds: number };
};

export const ReasonInput: FlowStepComponent<"REASON"> = ({ data: { common_reasons }, user }) => {
  console.log("In ReasonInput")
  const [inputValue, setInputValue] = useState("");
  const [signInReason, setSignInReason] = useAtom(sessionSignInReasonAtom);

  const {
    data: agreementToSign,
    isOpen: isAgreementDialogOpen,
    request: agreementConfirmation,
    resolve: confirmedAgreement,
    close: closeAgreementConfirmation,
  } = usePromiseDialog<AgreementToSign>(false);

  console.log("Prior to scary hooks")
  const { mutateAsync: signAgreement } = useMutation(orpc.users.signAgreement.mutationOptions());
  const [reasonName, setReasonName] = useState<string>("");

  const { finalise, setCanContinue, canContinue, focusNextStep } = useSignIn<"REASON">(async (transmit) => {
    while (true) {
      const { error } = await transmit({ reason: signInReason! });

      if (!error) {
        return;
      }
      let agreement: AgreementToSign;
      switch (error.code) {
        case "USER_AGREEMENT_NOT_SIGNED": {
          agreement = error.data;
          setReasonName("");
          break;
        }
        case "REASONS_AGREEMENT_NOT_SIGNED": {
          agreement = error.data.agreement;
          const { reason } = error.data;
          setReasonName(reason.name);
          break;
        }
        default:
          throw error;
      }
      const confirmed = await agreementConfirmation(agreement);
      if (!confirmed) {
        throw error;
      }

      await signAgreement({ id: user.id, agreement_id: agreement.id });
      continue;
    }
  });
  console.log("Stage 1 scary hooks")
  const { data: signInReasons } = useQuery(orpc.signIns.reasons.all.experimental_liveOptions());
  console.log("Stage 2 scary")
  const fuse = useMemo(
    () =>
      new Fuse<PartialReason>([], {
        keys: ["name"],
        includeScore: true,
        threshold: 0.6,
        ignoreLocation: true,
      }),
    [],
  );
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  useEffect(() => {
    if (signInReasons) {
      fuse.setCollection(signInReasons);
    }
  }, [signInReasons, fuse]);

  useEffect(() => {
    if (signInReason) {
      setCanContinue(true);
    }
  }, [signInReason, setCanContinue]);

  const handleSelectReason = (reason: PartialReason, focusNext: boolean = true) => {
    setInputValue("");
    setSignInReason(reason);
    setHighlightedIndex(-1);
    setCanContinue(true);
    if (focusNext) {
      focusNextStep();
    }
  };

  const handleClearReason = () => {
    setInputValue("");
    setSignInReason(null);
    setHighlightedIndex(-1);
    setCanContinue(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    setSignInReason(null);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && filteredReasons.length > 0) {
      event.preventDefault();
      setHighlightedIndex((prevIndex) => (prevIndex < filteredReasons.length - 1 ? prevIndex + 1 : prevIndex));
    } else if (event.key === "ArrowUp" && filteredReasons.length > 0) {
      event.preventDefault();
      setHighlightedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (highlightedIndex >= 0) {
        handleSelectReason(filteredReasons[highlightedIndex].item);
        if (canContinue) {
          await finalise!();
        }
      } else if (canContinue) {
        await finalise!();
      }
    } else if (event.key === "Escape") {
      handleClearReason();
    } else if (event.key >= "F1" && event.key <= "F6") {
      const index = Number.parseInt(event.key.slice(1)) - 1;
      if (index < common_reasons.length) {
        event.preventDefault();
        handleSelectReason(common_reasons[index], false);
      }
    }
  };

  const filteredReasons = inputValue ? fuse.search(inputValue, { limit: 20 }) : [];

  useEffect(() => {
    if (inputValue && filteredReasons.length > 0 && highlightedIndex === -1) {
      setHighlightedIndex(0);
    }
  }, [inputValue, filteredReasons, highlightedIndex]);

  return (
    <>
      <CardHeader>
        <CardTitle>Sign-In Reason Input</CardTitle>
        <CardDescription>Start typing to match your sign-in reason or pick from common reasons:</CardDescription>
        <div className="flex flex-wrap">
          {common_reasons.map((reason, index) => (
            <div key={reason.id} onClick={() => handleSelectReason(reason)} className="flex hover:cursor-pointer m-1">
              <SignInReason reason={reason} index={index} />
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <InputGroup>
            <InputGroupInput
              autoFocus={true}
              type="search"
              autoComplete="off"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Start typing a reason or press F1-F6 for quick selection..."
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>
          {inputValue && (
            <ul className="absolute top-full left-0 right-0 z-10 max-h-60 overflow-auto border border-gray-200 dark:border-gray-700 bg-card text-card-foreground mt-1">
              {filteredReasons.map((result, index) => (
                <li
                  key={result.item.id}
                  onClick={() => handleSelectReason(result.item)}
                  className={`cursor-pointer p-2 ${index === highlightedIndex ? "bg-accent" : "hover:bg-accent"}`}
                >
                  <div className="flex">
                    <Category category={result.item.category} className="mr-1" />
                    {result.item.name}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {signInReason && (
          <div className="mt-2 p-2 border border-gray-200 dark:border-gray-700 bg-card text-card-foreground">
            <p className="flex">
              Selected Reason:
              <strong className="flex ml-1">
                <Category category={signInReason.category} className="mr-1" /> {signInReason.name}
              </strong>
            </p>
          </div>
        )}

        <AlertDialog open={isAgreementDialogOpen} onOpenChange={(open) => !open && closeAgreementConfirmation()}>
          <AlertDialogContent className="max-h-[85vh] w-[95vw] max-w-5xl! overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle>{`Sign agreement to continue${reasonName ? ` for "${reasonName}"` : ""}?`}</AlertDialogTitle>
              <AlertDialogDescription>
                Review and sign this agreement to continue sign-in.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {agreementToSign ? <AgreementViewer agreement={agreementToSign} showLogo={false} /> : null}

            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => confirmedAgreement(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => confirmedAgreement(true)}>
                Sign and continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </>
  );
};
