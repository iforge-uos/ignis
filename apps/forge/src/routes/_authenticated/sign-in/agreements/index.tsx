import Title from "@/components/title";
import { useUserRoles } from "@/hooks/useUserRoles.ts";
import { getAgreements } from "@/services/root/getAgreements";
import { createFileRoute } from "@tanstack/react-router";
import { AgreementCard } from "./-components/AgreementCard";

export default function Component() {
  const roles = useUserRoles();
  const agreements = Route.useLoaderData();
  const isRep = roles.includes("rep");

  // Filter agreements based on user roles
  const filteredAgreements = agreements.filter((agreement) => {
    const isRepAgreement = agreement.reasons.some((reason) => reason.name === "Rep On Shift");

    // Show Rep On Shift agreement only to reps
    // Show all other agreements to everyone
    if (isRepAgreement) {
      return isRep;
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <Title prompt="User Agreements" />
      <h1 className="text-2xl sm:text-3xl font-bold text-center my-5">Agreements</h1>
      <p className="text-center mb-6">The signable agreements in the iForge.</p>
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${filteredAgreements.length === 1 ? "md:grid-cols-1 max-w-md mx-auto" : ""}`}
      >
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
