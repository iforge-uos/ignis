import Title from "@/components/title";
import { IForgeLogo } from "@/icons/IForge";
import { client, orpc } from "@/lib/orpc";
import { Button } from "@packages/ui/components/button";
import { Checkbox } from "@packages/ui/components/checkbox";
import { Label } from "@packages/ui/components/label";
import { Separator } from "@packages/ui/components/separator";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import Markdown from "react-markdown";
import { toast } from "sonner";

export default function Component() {
  const { id } = Route.useParams();
  const agreement = Route.useLoaderData();

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
      <div className="flex flex-col min-h-screen p-4 md:p-6">
        <div className="flex justify-center">
          <IForgeLogo className="w-72" />
        </div>
        <Separator className="mt-5 mb-5" />
        <div className="flex justify-center">
          <article className="prose lg:prose-xl dark:prose-invert leading-none prose-p:my-1 prose-li:my-2 prose-ul:my-2">
            <Markdown>{agreement?.content}</Markdown>
          </article>
        </div>
        <Separator className="mt-5 mb-5" />
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Last Updated: {new Date(agreement?.updated_at!).toLocaleDateString()}
        </p>{" "}
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Version: {agreement?.version}</p>
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
      </div>
    </>
  );
}

export const Route = createFileRoute("/_authenticated/sign-in/agreements/$id")({
  loader: ({ params }) => client.agreements.get({ id: params.id }),
  component: Component,
});
