import { DragOverlay, useDroppable } from "@dnd-kit/core";
import type { PartialReason, SignInEntry } from "@ignis/types/sign_in";
import { PartialUserWithTeams } from "@packages/types/users";
import { Alert, AlertDescription, AlertTitle } from "@packages/ui/components/alert";
import { Button } from "@packages/ui/components/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@packages/ui/components/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@packages/ui/components/tooltip";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { ArrowDownIcon, ArrowRightIcon, Ban } from "lucide-react";
import { FC, useCallback, useMemo, useState } from "react";
import { useDrop } from "react-dnd";
import { toast } from "sonner";
import { activeLocationAtom } from "@/atoms/signInAppAtoms";
import { cn, exhaustiveGuard, uCardNumberToString } from "@/lib/utils";
import { SignedInUserCard } from "@/routes/_authenticated/_reponly/sign-in/dashboard/-components/SignedInUserCard";

// SignInDrawer Props
interface SignInDrawerProps {
  title: string;
  entries: SignInEntry[];
  onShiftReps: PartialUserWithTeams[];
  onSignOut?: (user_id: string) => void;
  startExpanded?: boolean;
  isAdmin?: boolean;
  supportsDnd?: boolean;
  reason?: PartialReason;
  supportsSorting?: boolean;
}

const SORT_BY = ["Time", "Name"] as const;
type SORT_DIR = "asc" | "desc";
const GROUP_BY = ["None", "Tools", "Reason"] as const;

export const SignInDrawer: FC<SignInDrawerProps> = ({
  title,
  entries,
  startExpanded,
  onSignOut,
  onShiftReps,
  reason,
  isAdmin = false,
  supportsDnd = false,
  supportsSorting = false,
}) => {
  const [isOpen, setIsOpen] = useState(startExpanded);
  const [sortBy, setSortBy] = useState<(typeof SORT_BY)[number]>(SORT_BY[0]);
  const [sortOrder, setSortOrder] = useState<SORT_DIR>("desc");
  const [groupBy, setGroupBy] = useState<(typeof GROUP_BY)[number]>(GROUP_BY[0]);
  const activeLocation = useAtomValue(activeLocationAtom);
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
      queryClient.invalidateQueries({ queryKey: ["locationList", activeLocation] });
      queryClient.invalidateQueries({ queryKey: ["locationStatus"] });
    },
  });

  const sortedEntries = useMemo(() => {
    if (!supportsSorting) return entries;

    return [...entries].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "Name":
          comparison = a.user.display_name.localeCompare(b.user.display_name);
          break;
        case "Time":
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        default:
          exhaustiveGuard(sortBy);
      }

      return sortOrder === "desc" ? comparison : -comparison;
    });
  }, [entries, supportsSorting, sortBy, sortOrder]);

  const groupedEntries = useMemo(() => {
    if (!supportsSorting || groupBy === "None") return null;
    const groups = new Map<string, SignInEntry[]>();

    for (const entry of sortedEntries) {
      const add = (key: string) => {
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(entry);
      };
      switch (groupBy) {
        case "Tools":
          entry.tools.length > 0 ? entry.tools.map((t) => add(t.name)) : add("No Tools");
          break;
        case "Reason":
          add(entry.reason.name);
          break;
        default:
          exhaustiveGuard(groupBy);
      }
    }

    return Array.from(groups.entries()).map(([groupName, entries]) => ({
      groupName,
      entries,
    }));
  }, [supportsSorting, groupBy, sortedEntries]);

  const toggleOpen = () => setIsOpen(!isOpen);
  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: supportsDnd ? "SignedInUserCard" : "Nothing",
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
    drop: ({ user, reason: oldReason }: { user: PartialUserWithTeams; reason: PartialReason }) => {
      if (reason!.id === oldReason.id) return;
      changeReasonMutate({ user, newReason: reason! });
    },
  }));

  const isActive = canDrop && isOver;

  return (
    <Collapsible
      className={cn(
        "space-y-2 mt-2 mb-2 rounded-md transition-all duration-300 outline-2 outline-transparent",
        canDrop ? "outline-2 outline-gray-600 outline-dashed" : "",
        isActive ? "outline-green-500" : "",
      )}
      defaultOpen={startExpanded}
      ref={drop}
    >
      <CollapsibleTrigger asChild>
        <Button
          className="flex items-center justify-between space-x-4 py-7 w-full px-[18px]"
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
          {supportsSorting && entries.length > 0 && (
            <div className="mb-4 flex gap-x-4">
              <div className="flex gap-2 p-2 bg-muted rounded-md px-4">
                <span className="my-auto">Sort by:</span>
                {SORT_BY.map((key) => (
                  <Button
                    variant={sortBy === key ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSortBy(key)}
                    key={key}
                  >
                    {key}
                  </Button>
                ))}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    >
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Currently sorting {sortOrder === "asc" ? "descending" : "ascending"} order</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex gap-2 p-2 bg-muted rounded-md px-4">
                <span className="my-auto">Group by:</span>
                {GROUP_BY.map((key) => (
                  <Button
                    variant={groupBy === key ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setGroupBy(key)}
                    key={key}
                  >
                    {key}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-4 mr-4">
            {entries.length === 0 && (
              <Alert variant="default">
                <InfoCircledIcon className="h-4 w-4" />
                <AlertTitle>Info</AlertTitle>
                <AlertDescription>There are no users currently signed in.</AlertDescription>
              </Alert>
            )}
            {groupedEntries ? (
              <div className="w-full space-y-4">
                {groupedEntries.map(({ groupName, entries: groupEntries }) => (
                  <div key={groupName} className="border rounded-lg p-3 bg-background">
                    <h5 className="font-semibold text-sm mb-3 text-muted-foreground border-b pb-2">
                      {`${groupBy}: ${groupName} (${groupEntries.length} users)`}
                    </h5>
                    <div className="flex flex-wrap gap-4">
                      {groupEntries.map((entry) => (
                        <SignedInUserCard
                          key={entry.user.id}
                          user={entry.user as PartialUserWithTeams}
                          tools={entry.tools}
                          reason={entry.reason}
                          timeIn={entry.created_at}
                          onSignOut={() => onSignOut?.(entry.user.id)}
                          onShiftReps={onShiftReps}
                          isAdmin={isAdmin}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              sortedEntries.map((entry) => (
                <SignedInUserCard
                  key={entry.user.id}
                  user={entry.user as PartialUserWithTeams}
                  tools={entry.tools}
                  reason={entry.reason}
                  timeIn={entry.created_at}
                  onSignOut={() => onSignOut?.(entry.user.id)}
                  onShiftReps={onShiftReps}
                  isAdmin={isAdmin}
                />
              ))
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
