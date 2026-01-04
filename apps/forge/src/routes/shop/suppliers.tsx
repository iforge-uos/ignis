import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { orpc } from "@/lib/orpc";
import { ensureQueryData } from "@/lib/query-utils";

export const Route = createFileRoute("/shop/suppliers")({
  component: RouteComponent,
  loader: async ({ context }) => await ensureQueryData(
    context.queryClient,
    orpc.shop.items.all.queryOptions(),
  ),
});

function RouteComponent() {
  const items = Route.useLoaderData();

  const _suppliers: Record<string, { name: string; url: string | null; items: typeof items }> = {}

  for (const item of items) {
    const key = item.supplier;
    let supplier = _suppliers[key];
    if (!supplier) {
      supplier = _suppliers[key] = {
        name: item.supplier,
        url: item.supplier_url,
        items: [],
      };
    }
    supplier.items.push(item);
  }

  const suppliers = Object.values(_suppliers).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Suppliers</h1>
        <p className="text-muted-foreground">Browse items by supplier</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {suppliers.map((supplier) => {
          const totalItems = supplier.items.length;
          const totalStock = supplier.items.reduce(
            (sum, item) => sum + item.skews.reduce((s, skew) => s + (skew.count ?? 0), 0),
            0
          );

          return (
            <Card key={supplier.name}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{supplier.name}</CardTitle>
                    <CardDescription className="mt-2">
                      {totalItems} item{totalItems !== 1 ? "s" : ""} • {totalStock} units in stock
                    </CardDescription>
                  </div>
                  {supplier.url && (
                    <a
                      href={supplier.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {supplier.items.slice(0, 6).map((item) => (
                    <Link key={item.id} to="/shop/item/$id" params={{ id: item.id }}>
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                        <div className="w-12 h-12 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
                          <img
                            src={item.icon_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.skews.reduce((sum, s) => sum + (s.count ?? 0), 0)} in stock
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                {supplier.items.length > 6 && (
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    +{supplier.items.length - 6} more items
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
