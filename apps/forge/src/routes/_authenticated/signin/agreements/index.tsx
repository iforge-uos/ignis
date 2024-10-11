import { getAgreements } from "@/services/root/getAgreements";
import { Agreement } from "@ignis/types/root";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "@ui/components/ui/loader";
import { AgreementCard } from "@/routes/_authenticated/signin/agreements/-components/AgreementCard";
import { createFileRoute } from "@tanstack/react-router";
import Title from "@/components/title";
import { useUser } from "@/lib/utils";

export default function Component() {
  const user = useUser()!;
  const {
    data: agreements,
    isLoading,
    isError,
  } = useQuery<Agreement[]>({
    queryKey: ["agreements"],
    queryFn: getAgreements,
  });

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !agreements) {
    return <div className="text-center">Error loading agreements</div>;
  }

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

export const Route = createFileRoute("/_authenticated/signin/agreements/")({
  component: Component,
});
