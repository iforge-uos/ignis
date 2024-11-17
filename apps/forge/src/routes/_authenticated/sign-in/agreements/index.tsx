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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <Title prompt="User Agreements" />
      <h1 className="text-2xl sm:text-3xl font-bold text-center my-5">Agreements</h1>
      <p className="text-center mb-6">The signable agreements in the iForge.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAgreements.map((agreement) => (
          <AgreementCard key={agreement.id} agreement={agreement} />
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/sign-in/agreements/")({
  component: Component,
  loader: getAgreements,
});
