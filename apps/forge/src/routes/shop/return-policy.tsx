import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { Separator } from "@packages/ui/components/separator";
import { RouteUnfinished } from "@/components/routing/RouteUnfinished";

export const Route = createFileRoute("/shop/return-policy")({
  component: RouteUnfinished,
});

function RouteComponent() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Return Policy</h1>
        <p className="text-muted-foreground">Information about returns and refunds</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>General Return Policy</CardTitle>
            <CardDescription>Understanding our return process</CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>
              At iForge, we want you to be completely satisfied with your purchase. If you are not satisfied
              with an item you have purchased, you may return it within 30 days of delivery for a full refund
              or exchange.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Eligibility</CardTitle>
            <CardDescription>Items that can be returned</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Items that can be returned:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Unused items in original packaging</li>
                <li>Items with proof of purchase</li>
                <li>Items within 30 days of delivery</li>
                <li>Non-personalized or custom items</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Items that cannot be returned:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Custom or personalized items</li>
                <li>Items marked as final sale</li>
                <li>Opened consumable materials</li>
                <li>Items without proof of purchase</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Return Process</CardTitle>
            <CardDescription>How to initiate a return</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-3 text-sm">
              <li>
                <span className="font-medium">Contact us</span>
                <p className="ml-5 mt-1 text-muted-foreground">
                  Reach out to iForge staff to initiate your return request
                </p>
              </li>
              <li>
                <span className="font-medium">Prepare your item</span>
                <p className="ml-5 mt-1 text-muted-foreground">
                  Package the item securely in its original packaging if possible
                </p>
              </li>
              <li>
                <span className="font-medium">Return the item</span>
                <p className="ml-5 mt-1 text-muted-foreground">
                  Bring the item to the iForge during opening hours
                </p>
              </li>
              <li>
                <span className="font-medium">Receive your refund</span>
                <p className="ml-5 mt-1 text-muted-foreground">
                  Refunds will be processed within 5-7 business days
                </p>
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Refunds</CardTitle>
            <CardDescription>Payment and refund information</CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>
              Once your return is received and inspected, we will send you an email notification of the
              approval or rejection of your refund. If approved, your refund will be processed and a credit
              will automatically be applied to your original method of payment within 5-7 business days.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Need help with a return?</CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>
              If you have any questions about our return policy, please contact the iForge team during
              opening hours or reach out through our contact page.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
