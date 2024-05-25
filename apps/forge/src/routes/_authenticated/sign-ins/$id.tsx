import { UserAvatar } from "@/components/avatar";
import { errorDisplay } from "@/components/errors/ErrorDisplay";
import { getSignIn } from "@/services/root/getSigIn";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { Loader } from "@ui/components/ui/loader";
import { isAxiosError } from "axios";

export default function Component() {
  const { id } = Route.useParams();
  const { data, isLoading, error } = useQuery({
    queryFn: async () => getSignIn(id),
    queryKey: ["signIn", id],
  });
  if (isLoading) {
    return <Loader />;
  }
  if (error || !data) {
    // rhs of above should be never
    if (isAxiosError(error) && error.response?.status === 404) {
      throw notFound();
    }
    return errorDisplay({ error });
  }

  return (
    <>
      <div className="flex items-center justify-between bg-gray-900 px-6 py-4 text-white">
        <div className="flex items-center gap-4">
          <UserAvatar user={data.user} className="h-18 w-18" />
          <div>
            <h2 className="text-lg font-medium">{data.user.display_name}</h2>
            <p className="text-sm text-gray-400">Signed in at {data.created_at.toLocaleString()}</p>
            {data.ends_at && <p className="text-sm text-gray-400">Signed out at {data.ends_at.toLocaleString()}</p>}
          </div>
        </div>
      </div>
      <div className="px-6 py-8">
        <h3 className="mb-4 text-xl font-medium">Tools</h3>
        {data.tools.map((tool) => (
          <li key={tool}>{tool}</li>
        ))}
      </div>
    </>
  );
}

export const Route = createFileRoute("/_authenticated/sign-ins/$id")({
  component: Component,
});
