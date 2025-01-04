import Title from "@/components/title";
import { useUserRoles } from "@/hooks/useUserRoles.ts";
import { getAgreements } from "@/services/root/getAgreements";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader } from "@ui/components/ui/loader";
import { AgreementCard } from "./-components/AgreementCard";

export default function Component() {
  const roles = useUserRoles();
  const { data: agreements, error, isPending } = useQuery({ queryKey: ["agreements"], queryFn: getAgreements }); // cannot use loader here
  const isRep = roles.includes("rep");
  if (error) {
    throw error;
  }
  if (isPending) {
    return <Loader />;
  }

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
        className={`
        grid
        ${filteredAgreements.length === 1 ? "grid-cols-1 max-w-md mx-auto" : "grid-cols-1 md:grid-cols-2"}
        gap-6
      `}
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
});
