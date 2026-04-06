import { PartialReason, Training, User } from "@packages/types/sign_in";
import { PartialUserWithTeams } from "@packages/types/users";
import { Badge } from "@packages/ui/components/badge";
import { Button } from "@packages/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@packages/ui/components/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@packages/ui/components/tooltip";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { Edit } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { activeLocationAtom } from "@/atoms/signInAppAtoms";
import { Hammer } from "@/components/loading";
import { uCardNumberToString } from "@/lib/utils";
import { orpc } from "/src/lib/orpc";
import { SignInReason } from "../../../$ucard_number/-components/SignInReason";
import {ToolSelection} from "../../../$ucard_number/-components/ToolSelectionList";

interface SignInReasonWithToolsDisplayProps {
  id: string;
  tools: { id: string; name: string }[];
  reason: PartialReason;
  user: PartialUserWithTeams;
}

export const SignInReasonWithToolsDisplay: React.FC<SignInReasonWithToolsDisplayProps> = ({
  id,
  user,
  tools,
  reason,
}) => {
  const activeLocation = useAtomValue(activeLocationAtom);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = React.useState(false);
  const [newTools, setNewTools] = React.useState<{ id: string }[] | undefined>();
  const { data: availableTools, isPending: isUserDataPending } = useQuery({
    ...orpc.locations.tools.availableForUser.queryOptions({ input: { name: activeLocation, user_id: user.id } }),
    enabled: isUpdateDialogOpen,
  });
  const { mutate: updateSignInMutate } = useMutation({
    ...orpc.signIns.update.mutationOptions(),
    onSuccess: () => {
      toast.success("Successfully updated user sign-in information");
      setIsUpdateDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error updating sign-in information", error);
      toast.error("Failed to update user sign-in information");
    },
  });

  const handleUpdateSignIn = (newTools?: {id: string}[], newReason?: PartialReason) => {
    updateSignInMutate({ id, tools: newTools, reason: newReason });
    setIsUpdateDialogOpen(false);
  };

  return (
    <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
      <div className="my-4 p-4 bg-muted text-muted-foreground rounded-sm h-[90%]">
        <div className="border-gray-500 p-2 rounded-sm mb-4 justify-items-center">
          <div className="flex justify-center bg-card w-2/3 rounded-sm p-1 font-medium font-mono">Sign In Reason</div>
          <SignInReason reason={reason} />
        </div>
        <div className="border-gray-500 p-2 rounded-sm mb-4 justify-items-center">
          <div className="flex justify-center bg-card w-2/3 rounded-sm p-1 font-medium font-mono">Tools Used</div>
          <div className="flex flex-wrap gap-1 mt-2 justify-center">
            {tools
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((tool) => (
                <Badge variant="default" className="max-w-48 rounded-sm shadow-lg text-center" key={tool.id}>
                  {tool.name}
                </Badge>
              ))}
            <DialogTrigger asChild>
              <Tooltip>
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
              </Tooltip>
            </DialogTrigger>
          </div>
        </div>
      </div>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Update Sign-In Information</DialogTitle>
          <DialogDescription>Update a users tools after they've signed in</DialogDescription>
        </DialogHeader>
        {isUserDataPending ? (
          <Hammer/>
        ) : (
          availableTools && (
            <>
              <ToolSelection
                tools={availableTools || []}
                onSelectionChange={(newTools) => setNewTools(newTools)}
                onSubmit={() => {
                  newTools?.length !== 0 ? handleUpdateSignIn(newTools) : null;
                }}
                initialSelection={tools}
              />
              <Button onClick={() => handleUpdateSignIn(newTools)} disabled={newTools?.length === 0}>
                Finish update
              </Button>
            </>
          )
        )}
      </DialogContent>
    </Dialog>
  );
};
