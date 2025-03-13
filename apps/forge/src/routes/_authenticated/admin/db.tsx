import { getGelUiAuth } from "@/services/root/getGelUiAuth";
import { createFileRoute } from "@tanstack/react-router";
import { Alert, AlertDescription, AlertTitle } from "@ui/components/ui/alert";
import { Button } from "@ui/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@ui/components/ui/card";
import { ExternalLink, ShieldAlert } from "lucide-react";

function Component() {
  const authToken = Route.useLoaderData();

  return (
    <div className="container max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>Database Access</CardTitle>
          <CardDescription>Access the iForge database interface with your authentication token</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="warning">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Security Warning</AlertTitle>
            <AlertDescription>
              This will open the database with your authentication token in the URL. Do not share this URL with others
              as it contains your access credentials.
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
  loader: getGelUiAuth,
});
