import { activeLocationAtom } from "@/atoms/signInAppAtoms";
import { UserAvatar } from "@/components/avatar";
import { REP_OFF_SHIFT, REP_ON_SHIFT } from "@/lib/constants";
import { orpc } from "@/lib/orpc";
import { uCardNumberToString } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { AdminDisplay } from "@/routes/_authenticated/_reponly/sign-in/dashboard/-components/SignedInUserCard/AdminDisplay";
import { ManageUserWidget } from "@/routes/_authenticated/_reponly/sign-in/dashboard/-components/SignedInUserCard/ManageUserWidget";
import { SignInReasonWithToolsDisplay } from "@/routes/_authenticated/_reponly/sign-in/dashboard/-components/SignedInUserCard/SignInReasonDisplay";
import { TimeDisplay } from "@/routes/_authenticated/_reponly/sign-in/dashboard/-components/SignedInUserCard/TimeDisplay";
import type { LocationName, PartialReason } from "@ignis/types/sign_in";
import type { PartialUserWithTeams } from "@packages/types/users";
import { Badge } from "@packages/ui/components/badge";
import { Button } from "@packages/ui/components/button";
import { Card } from "@packages/ui/components/card";
import { Popover, PopoverContent, PopoverTrigger } from "@packages/ui/components/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@packages/ui/components/tooltip";
import { TeamIcon } from "@packages/ui/icons//Team";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useAtom } from "jotai";
import { LogOut, Plus } from "lucide-react";
import * as React from "react";
import { useDrag } from "react-dnd";
import { toast } from "sonner";

interface SignInUserCardProps {
  user: PartialUserWithTeams;
  tools?: string[];
  reason?: PartialReason;
  timeIn?: Date;
  onSignOut?: () => void;
  onShiftReps?: PartialUserWithTeams[];
  isAdmin?: boolean;
}

interface AddUserAttributesProps {
  onShiftReps: PartialUserWithTeams[] | undefined;
  user: PartialUserWithTeams;
  activeLocation: LocationName;
}

export function AddUserAttributes({ onShiftReps, user, activeLocation }: AddUserAttributesProps) {
  return (
    <Popover>
      <Tooltip>
        <PopoverTrigger asChild>
          <TooltipTrigger asChild>
            <Button variant="warning" disabled={!onShiftReps}>
              <Plus className="stroke-warning-foreground" />
              <span className="text-warning-foreground ml-1.5">Add</span>
            </Button>
          </TooltipTrigger>
        </PopoverTrigger>
        <TooltipContent>Add in-person training and infractions.</TooltipContent>
      </Tooltip>
      <PopoverContent className="mt-2 ml-2 w-[350px] shadow-xl border-2 border-gray-200 dark:border-gray-700">
        <ManageUserWidget user={user} onShiftReps={onShiftReps ?? []} locationName={activeLocation} />
      </PopoverContent>
    </Popover>
  );
}

export const SignedInUserCard: React.FunctionComponent<SignInUserCardProps> = ({
  user,
  tools,
  reason,
  timeIn,
  onSignOut,
  onShiftReps,
  isAdmin = false,
}) => {
  const [activeLocation] = useAtom(activeLocationAtom);
  const abortController = new AbortController();
  const queryClient = useQueryClient();

  const { mutate: signOutMutate } = useMutation(
    orpc.locations.signIn.signOut.mutationOptions({
      retry: 0,
      onError: (error) => {
        console.error("Error", error);
        abortController.abort();
      },
      onSuccess: async () => {
        abortController.abort();
        toast.success(
          <>
            Successfully signed out{" "}
            <a className="font-bold hover:underline underline-offset-4 hover:cursor-pointer" href={`/users/${user.id}`}>
              {user.display_name}
            </a>
          </>,
        );
        onSignOut?.();
        await queryClient.invalidateQueries({ queryKey: ["locationStatus"] });
        await queryClient.invalidateQueries({ queryKey: ["locationList", activeLocation] });
      },
    }),
  );

  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      signOutMutate(
        {
          name: activeLocation,
          ucard_number: uCardNumberToString(user.ucard_number),
        },
        {
          signal: abortController.signal,
        },
      );
    }
  };

  const canDrag = user.roles.some((r) => r.name === "Rep");
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "SignedInUserCard",
    canDrag,
    item: { user, reason },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
      handlerId: monitor.getHandlerId(),
    }),
    // end: (item, monitor) => {
    //   const dropResult = monitor.getDropResult<DropResult>();
    //   if (item && dropResult) {
    //     alert(`You dropped ${item.name} into ${dropResult.name}!`);
    //   }
    // },
  }));

  return (
    <Card className={cn("bg-card w-[240px] md:w-[300px] p-4 rounded-sm flex flex-col justify-between")} ref={drag}>
      <div>
        <div className="flex items-center justify-between mb-4 w-full space-x-2">
          <div className="w-2/3 p-1 flex-col">
            <Link to="/users/$id" params={user}>
              <h2 className="text-center text-lg font-bold hover:underline underline-offset-4">{user.display_name}</h2>
            </Link>
            <div>
              {user.teams?.map((team) => (
                <Badge
                  key={team.name}
                  variant="team"
                  className="flex items-center justify-start rounded-sm pt-1.5 pb-1.5 mt-2"
                >
                  <div className="flex gap-1 w-full text-center items-center">
                    <TeamIcon team={team.name} className="stroke-black dark:stroke-white mr-1 h-4 w-4" />
                    <p className="w-full text-xs">{team.name}</p>
                  </div>
                </Badge>
              ))}
            </div>
          </div>
          <div className="w-1/3 aspect-square">
            <UserAvatar user={user} className="w-full h-full aspect-square" draggable={false} />
          </div>
        </div>
      </div>
      {isAdmin && <AdminDisplay user={user} />}
      <div className="flex-grow">
        {!(reason?.name === REP_ON_SHIFT || reason?.name === REP_OFF_SHIFT) && (
          <SignInReasonWithToolsDisplay user={user} tools={tools!} reason={reason!} key={user.id} />
        )}
      </div>
      <TimeDisplay timeIn={timeIn} />
      <div className="pt-4 border-t border-gray-700 flex justify-between">
        <AddUserAttributes onShiftReps={onShiftReps} user={user} activeLocation={activeLocation} />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={handleSignOut} variant="destructive">
              <LogOut />
              <span className="ml-1.5">Sign Out</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Sign out User from the Active Location</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </Card>
  );
};
