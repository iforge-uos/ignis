import Title from "@/components/title";
import { client } from "@/lib/orpc";
import { createFileRoute } from "@tanstack/react-router";
import {} from "@tanstack/react-router";
import { AgreementCard } from "./-components/AgreementCard";


export default function Component() {
 const agreements = Route.useLoaderData();
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <Title prompt="User Agreements" />
      <h1 className="text-2xl sm:text-3xl font-bold text-center my-5">Agreements</h1>
      <p className="text-center mb-6">The signable agreements in the iForge.</p>
      <div
        className={`grid gap-6 mb-10 ${agreements.length === 1 ? "grid-cols-1 max-w-md mx-auto" : "grid-cols-1 md:grid-cols-2"}`}
      >
        {agreements.map((agreement) => (
          <AgreementCard key={agreement.id} agreement={agreement} />
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/sign-in/agreements/")({
  component: Component,
  loader: async ({context}) => client.agreements.all(),
});
