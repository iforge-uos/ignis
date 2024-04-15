import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@ui/components/ui/collapsible.tsx";
import { Button } from "@ui/components/ui/button.tsx";
import { ArrowDownIcon, ArrowRightIcon, Ban } from "lucide-react";
import { FC, useState } from "react";
import type { SignInEntry } from "@ignis/types/sign_in.ts";
import { Alert, AlertDescription, AlertTitle } from "@ui/components/ui/alert.tsx";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { SignedInUserCard } from "@/components/signin/dashboard/components/SignedInUserCard.tsx";
import { PartialUser } from "@ignis/types/users.ts";

// SignInDrawer Props
interface SignInDrawerProps {
  title: string;
  entries: SignInEntry[];
  onShiftReps: PartialUser[];
  onSignOut: (user_id: string) => void;
  startExpanded?: boolean;
}

export const SignInDrawer: FC<SignInDrawerProps> = ({ title, entries, startExpanded, onSignOut, onShiftReps }) => {
  const [isOpen, setIsOpen] = useState(startExpanded);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <>
      <Collapsible key="1" className="space-y-2 mt-2 mb-2" defaultOpen={startExpanded}>
        <div className="flex items-center justify-between space-x-4 px-4">
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-bold">{title}</h4>
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 text-sm font-semibold text-gray-900">
              {entries.length}
            </span>
          </div>
          <CollapsibleTrigger asChild>
            <Button
              className="flex items-center gap-2"
              size="sm"
              variant="outline"
              onClick={toggleOpen}
              disabled={entries.length === 0}
            >
              {entries.length === 0 ? (
                <Ban className="h-4 w-4" />
              ) : (
                <>
                  {isOpen ? "Hide" : "Show"}
                  {isOpen ? <ArrowRightIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
                  <span className="sr-only">{isOpen ? "Hide" : "Show"}</span>
                </>
              )}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent asChild>
          <div className="rounded-md border border-stone-200 px-4 py-4 font-mono text-sm dark:border-stone-950 shadow-lg">
            <div className="flex flex-wrap gap-4">
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
                  user={entry.user}
                  tools={entry.tools}
                  reason={entry.reason}
                  onSignOut={() => onSignOut(entry.user.id)}
                  onShiftReps={onShiftReps}
                />
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
};
