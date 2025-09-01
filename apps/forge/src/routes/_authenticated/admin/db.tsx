import { Alert, AlertDescription, AlertTitle } from "@packages/ui/components/alert";
import { Button } from "@packages/ui/components/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@packages/ui/components/card";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, ShieldAlert } from "lucide-react";
import { client } from "@/lib/orpc";

function Component() {
  const authToken = Route.useLoaderData();

  return (
    <div className="container max-w-md py-10 mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Database Access</CardTitle>
          <CardDescription>Access the iForge database</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="warning">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Security Warning</AlertTitle>
            <AlertDescription>
              *Do not* share the URL this creates with others as it contains the access credentials to the database.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => window.open(`https://db.iforge.sheffield.ac.uk/ui?authToken=${authToken}`)}
            className="w-full"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Access Database
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/admin/db")({
  component: Component,
  loader: client.admin.getGelUI,
});
