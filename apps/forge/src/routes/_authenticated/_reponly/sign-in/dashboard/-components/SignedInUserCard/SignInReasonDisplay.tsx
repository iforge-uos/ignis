import { activeLocationAtom } from "@/atoms/signInAppAtoms";
import { uCardNumberToString } from "@/lib/utils";
import { SignInReason } from "@/routes/_authenticated/_reponly/sign-in/actions/-components/SignInReason.tsx";
import { GetSignIn, PatchSignIn } from "@/services/sign_in/signInService";
import { PartialReason, Training, User } from "@ignis/types/sign_in.ts";
import { PartialUserWithTeams } from "@ignis/types/users";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@ui/components/ui/badge.tsx";
import { Button } from "@ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ui/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/components/ui/tooltip";
import { useAtomValue } from "jotai";
import { Edit } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import TrainingSelection from "../../../actions/-components/TrainingSelectionList";

interface SignInReasonWithToolsDisplayProps {
  tools: string[]; // FIXME after machines branch is done this should just be training
  reason: PartialReason;
  user: PartialUserWithTeams;
}

export const SignInReasonWithToolsDisplay: React.FC<SignInReasonWithToolsDisplayProps> = ({ user, tools, reason }) => {
  const activeLocation = useAtomValue(activeLocationAtom);
  const abortController = new AbortController();
  const queryClient = useQueryClient();
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = React.useState(false);
  const [tools_, setTools] = React.useState(tools);
  tools = tools_;
  const [newTools, setNewTools] = React.useState<string[] | undefined>();
  const { data: userData, isPending: isUserDataPending } = useQuery<User>({
    queryKey: ["getSignIn", user.ucard_number],
    queryFn: () =>
      GetSignIn({
        locationName: activeLocation,
        uCardNumber: uCardNumberToString(user.ucard_number),
        signal: abortController.signal,
        params: { fast: true },
      }),
    enabled: isUpdateDialogOpen,
  });
  const { mutate: updateSignInMutate } = useMutation({
    mutationKey: ["patchSignIn", user.ucard_number],
    mutationFn: (postBody: { tools?: string[]; reason?: PartialReason }) =>
      PatchSignIn({
        locationName: activeLocation,
        uCardNumber: uCardNumberToString(user.ucard_number),
        signal: abortController.signal,
        postBody,
      }),
    onSuccess: () => {
      toast.success("Successfully updated user sign-in information");
      queryClient.invalidateQueries({ queryKey: ["locationStatus", "locationList", { activeLocation }] });
      setTools(newTools!);
      setIsUpdateDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error updating sign-in information", error);
      toast.error("Failed to update user sign-in information");
    },
  });
  const toolsForSelection =
    React.useMemo(() => {
      if (tools) return userData?.training.filter((training) => tools.includes(training.name));
    }, [tools, userData]) || [];
  const handleUpdateSignIn = (newTools?: string[], newReason?: PartialReason) => {
    updateSignInMutate({ tools: newTools, reason: newReason });
    setIsUpdateDialogOpen(false);
  };

  return (
    <>
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <div className="my-4 p-4 bg-muted text-muted-foreground rounded-sm h-[90%]">
          <div className="border-gray-500 p-2 rounded-sm mb-4 justify-items-center">
            <div className="flex justify-center bg-card w-2/3 rounded-sm p-1 font-medium font-mono">Sign In Reason</div>
            <SignInReason reason={reason} />
          </div>
          <div className="border-gray-500 p-2 rounded-sm mb-4 justify-items-center">
            <div className="flex justify-center bg-card w-2/3 rounded-sm p-1 font-medium font-mono">Tools Used</div>
            <div className="flex flex-wrap gap-1 mt-2 justify-center">
              {/* {toolsForSelection
              ?.sort((a, b) => a.name.localeCompare(b.name))
              .map((tool) => (
                <Badge variant="default" className="max-w-48 rounded-sm shadow-lg text-center" key={tool.id}>
                {tool.name}
                </Badge>
                ))} */}
              {tools.sort().map((tool) => (
                <Badge variant="default" className="max-w-48 rounded-sm shadow-lg text-center" key={tool}>
                  {tool}
                </Badge>
              ))}
              <Tooltip>
                <DialogTrigger>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2 h-6 text-xs"
                      onClick={() => setIsUpdateDialogOpen(true)}
                    >
                      <Edit className="mr-2 h-3 w-3" />
                      Update
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Update user's tools</p>
                  </TooltipContent>
                </DialogTrigger>
              </Tooltip>
            </div>
          </div>
        </div>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Update Sign-In Information</DialogTitle>
            <DialogDescription>Update a users tools after they've signed in</DialogDescription>
          </DialogHeader>
          {isUserDataPending ? (
            <div>Loading...</div>
          ) : (
            userData && (
              <>
                <TrainingSelection
                  training={userData?.training || []}
                  onSelectionChange={(newTools) => setNewTools(newTools.map((t) => t.name))}
                  onSubmit={() => {
                    newTools?.length !== 0 ? handleUpdateSignIn(newTools) : null;
                  }}
                  initialSelection={toolsForSelection}
                />
                <Button onClick={() => handleUpdateSignIn(newTools)} disabled={newTools?.length === 0}>
                  Finish update
                </Button>
              </>
            )
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
