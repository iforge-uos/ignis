import { ErrorDisplayProps, errorDisplay } from "@/components/errors/ErrorDisplay";
import { Category } from "@/components/icons/SignInReason.tsx";
import { signinActions, useSignInSessionField } from "@/redux/signin.slice.ts";
import { AppDispatch } from "@/redux/store.ts";
import { useSignInReasons } from "@/services/signin/signInReasonService.ts";
import { FlowStepComponent } from "@/types/signInActions.ts";
import type { Reason } from "@ignis/types/sign_in.ts";
import { Button } from "@ui/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@ui/components/ui/card.tsx";
import { Input } from "@ui/components/ui/input.tsx";
import { Loader } from "@ui/components/ui/loader.tsx";
import Fuse from "fuse.js";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const SignInReasonInput: FlowStepComponent = ({ onSecondary, onPrimary }) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [selectedReason, setSelectedReason] = useState<Reason | null>(useSignInSessionField("sign_in_reason") ?? null);
  const { data: signInReasons, isLoading, isError, error } = useSignInReasons();
  const [fuse, setFuse] = useState<Fuse<Reason>>(new Fuse([], { keys: ["name"] }));
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [canContinue, setCanContinue] = useState<boolean>(false);
  const hasSessionError = useSignInSessionField("session_errored") ?? false;
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    // Initialize or update Fuse with the list of signInReasons when they change
    if (selectedReason && !hasSessionError) {
      setCanContinue(true);
      handleSelectReason(selectedReason);
    }
    if (signInReasons) {
      setFuse(
        new Fuse(signInReasons, {
          keys: ["name"],
          includeScore: true,
          threshold: 0.6, // Adjust this threshold maybe?
          ignoreLocation: true,
        }),
      );
    }
  }, [hasSessionError, signInReasons, selectedReason]);

  const handleSelectReason = (reason: Reason): void => {
    setInputValue(""); // Clear input value after selecting a reason
    setSelectedReason(reason); // Set the selected reason
    setHighlightedIndex(-1); // Reset highlighted index
    setCanContinue(true);
  };

  const handleClearReason = (): void => {
    setInputValue(""); // Clear input value after selecting a reason
    setSelectedReason(null); // Clear the selected reason
    setHighlightedIndex(-1); // Reset highlighted index
    setCanContinue(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setInputValue(event.target.value);
    setSelectedReason(null); // Clear selected reason when input changes
    setHighlightedIndex(-1); // Reset highlighted when input changes
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "ArrowDown" && filteredReasons.length > 0) {
      event.preventDefault();
      setHighlightedIndex((prevIndex) => (prevIndex < filteredReasons.length - 1 ? prevIndex + 1 : prevIndex));
    } else if (event.key === "ArrowUp" && filteredReasons.length > 0) {
      event.preventDefault();
      setHighlightedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (highlightedIndex >= 0) {
        // A reason is highlighted, select it.
        handleSelectReason(filteredReasons[highlightedIndex].item);
        // Optionally, delay the primary action to ensure canContinue is updated.
        setTimeout(() => {
          if (canContinue) {
            handlePrimaryClick();
          }
        }, 0); // Adjust delay as needed, though 0 might often be sufficient.
      } else if (canContinue) {
        // No reason is highlighted, but canContinue is true, trigger the primary action.
        handlePrimaryClick();
      }
    } else if (event.key === "Escape") {
      handleClearReason();
    }
  };

  const filteredReasons = inputValue ? fuse.search(inputValue, { limit: 20 }) : [];

  useEffect(() => {
    // Set highlightedIndex to 0 only when dropdown is first shown
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
      // Dispatch the selected reason to the store
      dispatch(signinActions.updateSignInSessionField("sign_in_reason", selectedReason as Reason));
    }
  };

  return (
    <>
      <Card className="w-[700px]">
        <CardHeader>
          <CardTitle>Sign-In Reason Input</CardTitle>
          <CardDescription>Start Typing to match your Sign-In Reason</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <Loader />}
          {isError && errorDisplay({ error } as ErrorDisplayProps)}
          {!(isLoading || isError) && (
            <div className="relative">
              <Input
                autoFocus={true}
                type="search" // I think this turns off 1password autocomplete which gets in the way of our actual auto-complete
                autoComplete="off" // so does this
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Start typing a reason..."
                className="mb-2"
              />
              {inputValue && (
                <ul className="absolute top-full left-0 right-0 z-10 max-h-60 overflow-auto border border-gray-200 dark:border-gray-700 bg-card text-card-foreground">
                  {filteredReasons.slice(0, 10).map((result, index) => (
                    <li
                      key={result.item.id}
                      onClick={() => handleSelectReason(result.item)}
                      onKeyUp={(event) => {
                        // Handle the 'Enter' key to mimic mouse click interaction
                        if (event.key === "Enter") {
                          handleSelectReason(result.item);
                        }
                      }}
                      className={`cursor-pointer p-2 ${index === highlightedIndex ? "bg-accent" : "hover:bg-accent"}`}
                    >
                      <div className="flex">
                        {<Category category={result.item.category} className="mr-1" />}
                        {result.item.name}
                      </div>
                    </li>
                  ))}

                  {filteredReasons.length > 10 &&
                    filteredReasons.slice(10).map((result, index) => (
                      <li
                        key={result.item.id}
                        onClick={() => handleSelectReason(result.item)}
                        onKeyUp={(event) => {
                          // Handle the 'Enter' key to mimic mouse click interaction
                          if (event.key === "Enter") {
                            handleSelectReason(result.item);
                          }
                        }}
                        className={`cursor-pointer p-2 ${index === highlightedIndex ? "bg-accent" : "hover:bg-accent"}`}
                      >
                        <div className="flex">{result.item.name}</div>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          )}
          {/* Display of a selected option */}
          {selectedReason && (
            <div className="mt-2 p-2 border border-gray-200 dark:border-gray-700 bg-card text-card-foreground">
              <p className="flex">
                Selected Reason:
                <strong className="flex ml-1">
                  {<Category category={selectedReason.category} className="mr-1" />} {selectedReason.name}
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
    </>
  );
};

export default SignInReasonInput;
