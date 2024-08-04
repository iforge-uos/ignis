import { UserAvatar } from "@/components/avatar";
import { LocationIcon } from "@/components/icons/Locations";
import { getSignIn } from "@/services/root/getSigIn";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Badge } from "@ui/components/ui/badge";
import { SignInReason } from "../_reponly/signin/actions/-components/SignInReason";

export default function Component() {
  const data = Route.useLoaderData();

  return (
    <>
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <UserAvatar user={data.user} className="h-18 w-18" />
          <div>
            <div className="flex gap-2">
              <Link to="/users/$id" params={data.user}>
                <h2 className="text-lg font-medium hover:underline underline-offset-4">{data.user.display_name}</h2>
              </Link>
              <div className="flex gap-1">
                {data.user.roles.map((role) => (
                  <Badge key={role.id} variant="outline" className="rounded-md">
                    {role.name}
                  </Badge>
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-400">Signed in at {data.created_at.toLocaleString()}</p>
            {data.ends_at && <p className="text-sm text-gray-400">Signed out at {data.ends_at.toLocaleString()}</p>}
          </div>
        </div>
        <Badge variant="outline" className="rounded-md">
          Signed into
          <LocationIcon location={data.location.name} />
        </Badge>
      </div>
      <div className="flex items-center gap-2 px-6 py-4">
        <span>Reason</span>
        <SignInReason reason={data.reason} />
      </div>
      {data.tools.length !== 0 && (
        <div className="px-6 py-8">
          <h3 className="mb-4 text-xl font-medium">Tools</h3>
          {data.tools.map((tool) => (
            <li key={tool}>{tool}</li>
          ))}
        </div>
      )}
    </>
  );
}

export const Route = createFileRoute("/_authenticated/sign-ins/$id")({
  loader: async ({ params }) => await getSignIn(params.id),
  component: Component,
  staticData: { title: "Sign In" },
});
