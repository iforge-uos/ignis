import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { Alert, AlertDescription, AlertTitle } from "@packages/ui/components/alert";
import { InfoIcon } from "lucide-react";

export const Route = createFileRoute("/shop/orders")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Orders</h1>
        <p className="text-muted-foreground">View your order history</p>
      </div>

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Coming Soon</AlertTitle>
        <AlertDescription>
          Order history and tracking functionality will be available once the shopping cart and checkout system are implemented.
        </AlertDescription>
      </Alert>

      <div className="mt-8 grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your recent purchase history will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">No orders yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Your order history will appear here once you make your first purchase
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
