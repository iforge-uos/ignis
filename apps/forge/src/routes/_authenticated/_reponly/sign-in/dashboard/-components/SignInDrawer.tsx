import { REP_OFF_SHIFT, REP_ON_SHIFT } from "@/lib/constants";
import { uCardNumberToString } from "@/lib/utils";
import { AppRootState } from "@/redux/store";
import { SignedInUserCard } from "@/routes/_authenticated/_reponly/sign-in/dashboard/-components/SignedInUserCard";
import { useSignInReasons } from "@/services/sign_in/signInReasonService";
import { PatchSignIn } from "@/services/sign_in/signInService";
import type { PartialReason, SignInEntry } from "@ignis/types/sign_in.ts";
import { PartialUserWithTeams } from "@ignis/types/users.ts";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@ui/components/ui/alert.tsx";
import { Button } from "@ui/components/ui/button.tsx";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@ui/components/ui/collapsible.tsx";
import { ArrowDownIcon, ArrowRightIcon, Ban } from "lucide-react";
import { FC, useState } from "react";
import { useDrop } from "react-dnd";
import { useSelector } from "react-redux";
import { toast } from "sonner";

// SignInDrawer Props
interface SignInDrawerProps {
  title: string;
  entries: SignInEntry[];
  onShiftReps: PartialUserWithTeams[];
  onSignOut: (user_id: string) => void;
  startExpanded?: boolean;
  isAdmin?: boolean;
  reason?: PartialReason;
}

export const SignInDrawer: FC<SignInDrawerProps> = ({
  title,
  entries,
  startExpanded,
  onSignOut,
  onShiftReps,
  isAdmin = false,
  reason,
}) => {
  const activeLocation = useSelector((state: AppRootState) => state.signIn.active_location);
  const [isOpen, setIsOpen] = useState(startExpanded);
  const abortController = new AbortController();
  const queryClient = useQueryClient();

  const { mutate: changeReasonMutate } = useMutation({
    mutationKey: ["patchSignIn"],
    mutationFn: ({ user, newReason }: { user: PartialUserWithTeams; newReason: PartialReason }) =>
      PatchSignIn({
        locationName: activeLocation,
        uCardNumber: uCardNumberToString(user.ucard_number),
        signal: abortController.signal,
        postBody: {
          reason_id: newReason.id,
        },
      }),
    retry: 0,
    onError: (error) => {
      console.error("Error", error);
      abortController.abort();
      toast.error("Failed to set new shift type");
    },
    onSuccess: (_data, { user }) => {
      abortController.abort();
      toast.success("Successfully changed shift type");
      queryClient.invalidateQueries({ queryKey: ["locationStatus", "locationList", { activeLocation }] });
      const updatedEntries = entries.filter((entry) => entry.user.id !== user.id);
    },
  });

  const [, drop] = useDrop(() => ({
    accept: "SignedInUserCard",
    drop: ({ user, reason: oldReason }: { user: PartialUserWithTeams; reason: PartialReason }) => {
      console.log(reason, oldReason);
      if (reason === oldReason) return;
      changeReasonMutate({ user, newReason: reason! });
    },
  }));

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <Collapsible className="space-y-2 mt-2 mb-2" defaultOpen={startExpanded} ref={drop}>
      <CollapsibleTrigger asChild>
        <Button
          className="flex items-center justify-between space-x-4 py-7 w-full"
          style={{ paddingLeft: "18px", paddingRight: "18px" }}
          size="sm"
          variant="outline"
          onClick={toggleOpen}
          disabled={entries.length === 0}
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-sm bg-primary text-sm font-semibold text-primary-foreground">
              {entries.length}
            </span>
            <h4 className="text-lg font-bold">{title}</h4>
          </div>
          <div className="flex items-center gap-2">
            {entries.length === 0 ? (
              <Ban className="h-4 w-4" />
            ) : (
              <>
                {isOpen ? "Hide" : "Show"}
                {isOpen ? <ArrowRightIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
                <span className="sr-only">{isOpen ? "Hide" : "Show"}</span>
              </>
            )}
          </div>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent asChild>
        <div className="rounded-md border border-gray-100 px-4 py-4 font-mono text-sm dark:border-black dark:border-opacity-15 shadow-md">
          <div className="flex flex-wrap gap-4 mr-4">
            {entries.length === 0 && (
              <Alert variant="default">
                <InfoCircledIcon className="h-4 w-4" />
                <AlertTitle>Info</AlertTitle>
                <AlertDescription>There are no users currently signed in.</AlertDescription>
              </Alert>
            )}
            {entries.map((entry) => (
              <SignedInUserCard
                key={entry.user.id}
                user={entry.user as PartialUserWithTeams}
                tools={entry.tools}
                reason={entry.reason}
                timeIn={entry.created_at}
                onSignOut={() => onSignOut(entry.user.id)}
                onShiftReps={onShiftReps}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};