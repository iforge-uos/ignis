import { Badge } from "@packages/ui/components/badge";
import { Button } from "@packages/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { Checkbox } from "@packages/ui/components/checkbox";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@packages/ui/components/input-group";
import { Label } from "@packages/ui/components/label";
import { Separator } from "@packages/ui/components/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@packages/ui/components/table";
import { createFileRoute } from "@tanstack/react-router";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ExternalLink, Package, Search } from "lucide-react";
import * as React from "react";
import { orpc } from "@/lib/orpc";
import { ensureQueryData } from "@/lib/query-utils";
import { toTitleCase } from "@/lib/utils";
import { cn } from "@/lib/utils/cn";

export const Route = createFileRoute("/shop/item/$id")({
  component: RouteComponent,
  loader: async ({ context, params }) => await ensureQueryData(
    context.queryClient,
    orpc.shop.items.get.queryOptions({ input: params }),
  ),
});

const formatPrice = (price: number) => `£${(price / 100).toFixed(2)}`;

function SortableHeader({ column, children }: { column: any; children: React.ReactNode }) {
  const sorted = column.getIsSorted();
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="-ml-4 h-auto p-2 hover:bg-transparent"
    >
      {children}
      <div className="ml-2 relative w-4 h-4">
        {sorted === "asc" ? (
          <ArrowUp className="h-4 w-4 absolute inset-0" />
        ) : sorted === "desc" ? (
          <ArrowDown className="h-4 w-4 absolute inset-0" />
        ) : (
          <ArrowUpDown className="h-4 w-4 absolute inset-0" />
        )}
      </div>
    </Button>
  );
}

function RouteComponent() {
  const item = Route.useLoaderData();
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "price", desc: false }]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [showOnlyInStock, setShowOnlyInStock] = React.useState(false);

  const totalStock = item.skews.reduce((sum, skew) => sum + (skew.count ?? 0), 0);

  item.skews[0].dimensions

  const table = useReactTable({
    data: (showOnlyInStock ? item.skews.filter((skew) => (skew.count ?? 0) > 0) : item.skews),
    columns: [
      ...item.skews[0].dimensions.fields.map(
        (field) => ({
          id: field.name,
          accessorFn: (row) => row.dimensions[field.name],
          header: ({ column }) => <SortableHeader column={column}>{toTitleCase(field.name)}</SortableHeader>,
          cell: ({ row }) => <span className="font-semibold">{row.original.dimensions[field.name]}</span>,
        }) satisfies ColumnDef<(typeof item.skews)[number]>
      ),
      {
        accessorKey: "price",
        header: ({ column }) => <SortableHeader column={column}>Price</SortableHeader>,
        cell: ({ row }) => <span className="font-semibold">{formatPrice(row.original.price)}</span>,
      },
      {
        accessorKey: "count",
        header: "Stock",
        cell: ({ row }) => {
          const count = row.original.count;
          return count !== null ? (
            <Badge variant={count > 0 ? "success" : "destructive"}>{count}</Badge>
          ) : (
            <span className="text-muted-foreground">N/A</span>
          );
        },
      },
      {
        accessorKey: "colour",
        header: "Colour",
        cell: ({ row }) => {
          const colour = row.original.colour;
          return colour ? <Badge variant="outline">{colour}</Badge> : <span className="text-muted-foreground">-</span>;
        },
      },
    ],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    enableMultiSort: false,
    state: {
      sorting,
      globalFilter,
    },
  });

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Image Section */}
        <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
          <img src={`/shop/${item.icon_url}`} alt={item.name} className="w-full h-full object-cover" />
        </div>

        {/* Info Section */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{item.name}</h1>

          <div className="flex items-center gap-2 mb-6">
            <span className="text-muted-foreground">Supplied by:</span>
            {item.supplier_url ? (
              <a
                href={item.supplier_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:underline inline-flex items-center gap-1"
              >
                {item.supplier}
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : (
              <span className="font-medium">{item.supplier}</span>
            )}
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Available Options:</span>
              <Badge variant="secondary">{item.skews.length} variants</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Stock:</span>
              <Badge variant={totalStock > 0 ? "success" : "destructive"}>
                <Package className="mr-1 h-3 w-3" />
                {totalStock > 0 ? `${totalStock} in stock` : "Out of stock"}
              </Badge>
            </div>

            {item.tools.length > 0 && (
              <>
                <Separator className="my-4" />
                <div>
                  <h3 className="font-semibold mb-2">Compatible Tools:</h3>
                  <div className="flex flex-wrap gap-2">
                    {item.tools.map((tool) => (
                      <Badge key={tool.name} variant="outline">
                        {tool.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Variants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Available Variants</CardTitle>
          <CardDescription>Browse all available options and pricing for {item.name}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <InputGroup className="flex-1">
              <InputGroupAddon>
                <InputGroupText>
                  <Search />
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search variants..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
            </InputGroup>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="in-stock"
                checked={showOnlyInStock}
                onCheckedChange={(checked) => setShowOnlyInStock(checked === true)}
              />
              <Label
                htmlFor="in-stock"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Show only in stock
              </Label>
            </div>
          </div>
          <Table >
            <TableHeader className="bg-accent">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header, idx, arr) => (
                    <TableHead key={header.id} className={cn("text-center", idx === 0 ? "rounded-tl-lg" : "", idx === arr.length - 1 ? "rounded-tr-lg" : "")}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="text-center">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                    No variants available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
