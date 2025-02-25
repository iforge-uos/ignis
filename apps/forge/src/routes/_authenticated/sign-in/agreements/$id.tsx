import axiosInstance from "@/api/axiosInstance";
import Title from "@/components/title";
import { useUser } from "@/lib/utils";
import { getAgreement } from "@/services/root/getAgreement";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@ui/components/ui/button";
import { Checkbox } from "@ui/components/ui/checkbox";
import { Label } from "@ui/components/ui/label";
import { Separator } from "@ui/components/ui/separator";
import { useState, useCallback } from "react";
import Markdown from "react-markdown";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useVerifyAuthentication } from "@/hooks/useVerifyAuthentication";
import { getAgreements } from "@/services/root/getAgreements";

export default function Component() {
  const { id } = Route.useParams();
  const agreement = Route.useLoaderData();

  const [isChecked, setIsChecked] = useState<string | boolean>(false);
  const user = useUser()!;
  const navigator = useNavigate();
  const queryClient = useQueryClient();
  const { verifyAuthentication } = useVerifyAuthentication();

  const handleSignAgreement = useCallback(async () => {
    if (!isChecked) return;

    try {
      await axiosInstance.post(`/agreements/${id}`, { user });

      await Promise.all([
        verifyAuthentication(),
        queryClient.invalidateQueries({ queryKey: ["agreements"] })
      ]);

      await queryClient.ensureQueryData({
        queryKey: ["agreements"],
        queryFn: getAgreements
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      toast.success("Successfully signed agreement");

      navigator({
        to: "/sign-in/agreements",
        replace: true
      });
    } catch (error) {
      console.error("Error signing agreement:", error);
      toast.error("Failed to sign agreement");
    }
  }, [isChecked, id, user, queryClient, verifyAuthentication, navigator]);

  return (
    <>
      <Title prompt="Sign Agreement" />
      <div className="flex flex-col min-h-screen p-4 md:p-6">
        <div className="flex justify-center">
          <img src={`${import.meta.env.VITE_CDN_URL}/logos/iforge.png`} alt="iForge logo" width={300} />
        </div>
        <Separator className="mt-5 mb-5" />
        <div className="flex justify-center">
          <article className="prose lg:prose-xl dark:prose-invert text-justify">
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
            I have read and accept the terms of this Agreement.
          </Label>
        </div>
        <Button
          className="mt-4 w-full"
          disabled={!isChecked}
          onClick={handleSignAgreement}
        >
          Confirm
        </Button>
      </div>
    </>
  );
}

export const Route = createFileRoute("/_authenticated/sign-in/agreements/$id")({
  loader: ({ params }) => getAgreement(params.id),
  component: Component,
});
