import { SignedInUserCard } from "@/routes/_authenticated/_reponly/signin/dashboard/-components/SignedInUserCard";
import type { SignInEntry } from "@ignis/types/sign_in.ts";
import { PartialUserWithTeams } from "@ignis/types/users.ts";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Alert, AlertDescription, AlertTitle } from "@ui/components/ui/alert.tsx";
import { Button } from "@ui/components/ui/button.tsx";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@ui/components/ui/collapsible.tsx";
import { ArrowDownIcon, ArrowRightIcon, Ban } from "lucide-react";
import { FC, useState } from "react";

// SignInDrawer Props
interface SignInDrawerProps {
  title: string;
  entries: SignInEntry[];
  onShiftReps: PartialUserWithTeams[];
  onSignOut: (user_id: string) => void;
  startExpanded?: boolean;
  isAdmin?: boolean;
}

export const SignInDrawer: FC<SignInDrawerProps> = ({
  title,
  entries,
  startExpanded,
  onSignOut,
  onShiftReps,
  isAdmin = false,
}) => {
  const [isOpen, setIsOpen] = useState(startExpanded);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <>
      <Collapsible key="1" className="space-y-2 mt-2 mb-2" defaultOpen={startExpanded}>
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
    </>
  );
};
