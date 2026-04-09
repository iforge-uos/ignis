import { Button } from "@packages/ui/components/button";
import { Checkbox } from "@packages/ui/components/checkbox";
import { Label } from "@packages/ui/components/label";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AgreementViewer } from "@/components/sign-in/AgreementViewer";
import Title from "@/components/title";
import { orpc } from "@/lib/orpc";
import { ensureQueryData } from "@/lib/query-utils";

function Component() {
  const { id } = Route.useParams();
  const agreement = Route.useLoaderData()!;

  const [isChecked, setIsChecked] = useState<string | boolean>(false);
  const navigator = useNavigate();

  const { mutate } = useMutation(
    orpc.users.signAgreement.mutationOptions({
      onSuccess: async () => {
        toast.success("Successfully signed agreement");
        navigator({ to: "/" });
      },
      onError: (error) => {
        console.error("Error signing agreement:", error);
        toast.error("Failed to sign agreement");
      },
    }),
  );

  return (
    <>
      <Title prompt="Sign Agreement" />
      <AgreementViewer
        agreement={agreement}
        className="min-h-screen p-4 md:p-6"
        footer={
          <>
            {/* TODO include the sign in reasons this is valid for somehow sign for a user if we're an admin? */}
            <br />
            <div className="flex items-center space-x-2">
              <Checkbox id="accept" onCheckedChange={(e) => setIsChecked(e)} />
              <Label className="text-gray-600 dark:text-gray-400" htmlFor="accept">
                I have read and accept the terms of this agreement.
              </Label>
            </div>
            <Button
              className="my-4 w-full"
              disabled={!isChecked}
              onClick={() => mutate({ id, agreement_id: agreement.id })}
            >
              Confirm
            </Button>
          </>
        }
      />
    </>
  );
}

export const Route = createFileRoute("/_authenticated/user/agreements/$id")({
  loader: async ({ context, params }) =>
    await ensureQueryData(
      context.queryClient,
      orpc.agreements.get.queryOptions({ input: { id: params.id } }),
    ),
  component: Component,
});
