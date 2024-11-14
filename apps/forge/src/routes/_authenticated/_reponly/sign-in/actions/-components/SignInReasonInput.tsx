import { ErrorDisplayProps, errorDisplay } from "@/components/errors/ErrorDisplay";
import { Category } from "@/components/icons/SignInReason";
import { extractError } from "@/lib/utils";
import { getCommonReasons, useSignInReasons } from "@/services/sign_in/signInReasonService";
import { FlowStepComponent } from "@/types/signInActions";
import type { PartialReason, Reason } from "@ignis/types/sign_in";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@ui/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@ui/components/ui/card";
import { Input } from "@ui/components/ui/input";
import { Loader } from "@ui/components/ui/loader";
import Fuse from "fuse.js";
import React, { useEffect, useState } from "react";
import { SignInReason } from "./SignInReason";
import {useAtom} from "jotai";
import {activeLocationAtom, sessionAtom, sessionFieldAtom} from "@/atoms/signInAppAtoms.ts";

export const SignInReasonInput: FlowStepComponent = ({ onSecondary, onPrimary }) => {
  const [inputValue, setInputValue] = useState("");
  const [, setSession] = useAtom(sessionAtom);
  const [activeLocation] = useAtom(activeLocationAtom);
  const [signInReason] = useAtom(sessionFieldAtom('sign_in_reason'));
  const [sessionErrored] = useAtom(sessionFieldAtom('session_errored'));
  const [user] = useAtom(sessionFieldAtom('user'));

  const [selectedReason, setSelectedReason] = useState<PartialReason | null>(signInReason ?? null);
  const { data: signInReasons, isLoading, isError, error } = useSignInReasons();
  const [fuse, setFuse] = useState<Fuse<PartialReason>>(new Fuse([], { keys: ["name"] }));
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [canContinue, setCanContinue] = useState<boolean>(false);

  const {
    data: commonReasons,
    error: commonReasonsError,
    isLoading: commonReasonsIsLoading,
  } = useQuery({
    queryKey: ["getCommonReasons", activeLocation],
    queryFn: () => getCommonReasons(activeLocation, user?.is_rep),
  });

  useEffect(() => {
    if (selectedReason && !sessionErrored) {
      setCanContinue(true);
      handleSelectReason(selectedReason);
    }
    if (signInReasons) {
      setFuse(
          new Fuse(signInReasons, {
            keys: ["name"],
            includeScore: true,
            threshold: 0.6,
            ignoreLocation: true,
          }),
      );
    }
  }, [sessionErrored, signInReasons, selectedReason]);

  const handleSelectReason = (reason: PartialReason) => {
    setInputValue("");
    setSelectedReason(reason);
    setHighlightedIndex(-1);
    setCanContinue(true);
  };

  const handleClearReason = () => {
    setInputValue("");
    setSelectedReason(null);
    setHighlightedIndex(-1);
    setCanContinue(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    setSelectedReason(null);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
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
        setTimeout(() => {
          if (canContinue) {
            handlePrimaryClick();
          }
        }, 0);
      } else if (canContinue) {
        handlePrimaryClick();
      }
    } else if (event.key === "Escape") {
      handleClearReason();
    } else if (event.key >= "F1" && event.key <= "F6") {
      const index = Number.parseInt(event.key.slice(1)) - 1;
      if (commonReasons && index < commonReasons.length) {
        event.preventDefault();
        handleSelectReason(commonReasons[index]);
      }
    }
  };

  const filteredReasons = inputValue ? fuse.search(inputValue, { limit: 20 }) : [];

  useEffect(() => {
    if (inputValue && filteredReasons.length > 0 && highlightedIndex === -1) {
      setHighlightedIndex(0);
    }
  }, [inputValue, filteredReasons.length, highlightedIndex]);

  const handleSecondaryClick = () => {
    onSecondary?.();
  };

  const handlePrimaryClick = () => {
    if (canContinue) {
      onPrimary?.();
      setSession(prev => prev ? {
        ...prev,
        sign_in_reason: selectedReason as Reason
      } : null);
    }
  };


  return (
    <Card className="w-[700px]">
      <CardHeader>
        <CardTitle>Sign-In Reason Input</CardTitle>
        <CardDescription>Start typing to match your sign-in reason or pick a recent common reason:</CardDescription>
        {commonReasonsError ? ( // FIXME
          `Failed to fetch common reasons: ${extractError(commonReasonsError)}`
        ) : commonReasonsIsLoading ? (
          <Loader />
        ) : (
          <div className="flex flex-wrap">
            {commonReasons?.map((reason, index) => (
              <div key={reason.id} onClick={() => handleSelectReason(reason)} className="flex hover:cursor-pointer m-1">
                <SignInReason reason={reason} index={index} />
              </div>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading && <Loader />}
        {isError && errorDisplay({ error } as ErrorDisplayProps)}
        {!(isLoading || isError) && (
          <div className="relative">
            <Input
              autoFocus={true}
              type="search"
              autoComplete="off"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Start typing a reason or press F1-F6 for quick selection..."
              className="mb-2"
            />
            {inputValue && (
              <ul className="absolute top-full left-0 right-0 z-10 max-h-60 overflow-auto border border-gray-200 dark:border-gray-700 bg-card text-card-foreground">
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
        )}
        {selectedReason && (
          <div className="mt-2 p-2 border border-gray-200 dark:border-gray-700 bg-card text-card-foreground">
            <p className="flex">
              Selected Reason:
              <strong className="flex ml-1">
                <Category category={selectedReason.category} className="mr-1" /> {selectedReason.name}
              </strong>
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleSecondaryClick}>
          Go Back
        </Button>
        <Button onClick={handlePrimaryClick} disabled={!canContinue}>
          Sign In
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SignInReasonInput;
