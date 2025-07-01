import { createFileRoute } from "@tanstack/react-router"
import Title from "@/components/title";
import { useUserRoles } from "@/hooks/useUserRoles";
import { orpc } from "@/lib/orpc";
import Loader from "@packages/ui/components/loader";
import { useQuery } from "@tanstack/react-query";
import {} from "@tanstack/react-router";
import { Suspense } from "react";
import { AgreementCard } from "./-components/AgreementCard";
import { REP_ON_SHIFT } from "@/lib/constants";

function AgreementsList() {
  const roles = useUserRoles();
  const { data: agreements = [] } = useQuery(
    orpc.agreements.all.queryOptions({
      refetchOnMount: "always",
      staleTime: 0,
      networkMode: "always",
    }),
  );

  const isRep = roles.includes("rep");

  // Filter agreements based on user roles
  const filteredAgreements = agreements.filter((agreement) => {
    const isRepAgreement = agreement.reasons.some((reason) => reason.name === REP_ON_SHIFT);

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

export default function Component() {
  return (
    <Suspense fallback={<Loader />}>
      <AgreementsList />
    </Suspense>
  );
}

export const Route = createFileRoute("/_authenticated/sign-in/agreements/")({
  component: Component,
});
