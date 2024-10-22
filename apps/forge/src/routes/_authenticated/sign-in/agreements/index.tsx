import Title from "@/components/title";
import { useUser } from "@/lib/utils";
import { getAgreements } from "@/services/root/getAgreements";
import { createFileRoute } from "@tanstack/react-router";
import { AgreementCard } from "./-components/AgreementCard";

export default function Component() {
  const user = useUser()!;
  const agreements = Route.useLoaderData();

  // Filter agreements based on user role
  const filteredAgreements = agreements.filter((agreement) => {
    // If the user is not a Rep, filter out the Rep On Shift agreement
    if (!user.roles.find((role) => role.name === "Rep")) {
      return !agreement.reasons.some((reason) => reason.name === "Rep On Shift");
    }
    // If the user is a Rep, show all agreements
    return true;
  });

  return (
    <>
      <Title prompt="User Agreements" />
      <h1 className="text-3xl font-bold text-center m-5">Agreements</h1>
      <p className="accent-accent text-center">The signable agreements in the iForge.</p>
      <div className="flex flex-col items-center mt-4 gap-4">
        {filteredAgreements.map((agreement) => (
          <AgreementCard key={agreement.id} agreement={agreement} />
        ))}
      </div>
    </>
  );
}

export const Route = createFileRoute("/_authenticated/sign-in/agreements/")({
  component: Component,
  loader: getAgreements,
});
