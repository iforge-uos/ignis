import { Badge } from "@packages/ui/components/badge";
import { Button } from "@packages/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@packages/ui/components/input-group";
import { Label } from "@packages/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@packages/ui/components/select";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpDown, Building2, Package, Search, X } from "lucide-react";
import { useState } from "react";
import { orpc } from "@/lib/orpc";
import { ensureQueryData } from "@/lib/query-utils";
import { Procedures } from "/src/types/router";

/**
 * TODO
 * - Server-side filtering and pagination for better performance
 * - Category/tag system for materials
 * - User cart functionality
 * - Supplier information expansion
 * - Material usage/compatibility with specific tools
 */

export const Route = createFileRoute("/shop/")({
  component: RouteComponent,
  loader: async ({ context }) => await ensureQueryData(context.queryClient, orpc.shop.items.all.queryOptions()),
});

type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc" | "options-desc";
type Material = NonNullable<Procedures["shop"]["items"]["all"]>[number];

const getPriceRange = (material: Material) => {
  const prices = material.skews.map((s) => s.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return { min, max };
};

const formatPriceRange = (material: Material) => {
  const { min, max } = getPriceRange(material);
  return min === max ? `£${(min / 100).toFixed(2)}` : `£${(min / 100).toFixed(2)} - £${(max / 100).toFixed(2)}`;
};

const hasStock = (material: Material) => {
  return material.skews.some((s) => s.count !== null && s.count > 0);
};

const getTotalStock = (material: Material) => {
  return material.skews.reduce((sum, s) => sum + (s.count ?? 0), 0);
};

function RouteComponent() {
  const materials = Route.useLoaderData();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [showFilters, setShowFilters] = useState(true);

  // Get unique suppliers
  const suppliers = [...new Set(materials.map((m) => m.supplier))].sort();

  const filteredMaterials = materials.filter((material: Material) => {
    // Search filter
    const matchesSearch =
      material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.supplier.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Supplier filter
    if (selectedSupplier !== "all" && material.supplier !== selectedSupplier) {
      return false;
    }

    // Stock filter
    if (stockFilter === "in-stock" && !hasStock(material)) {
      return false;
    } else if (stockFilter === "out-of-stock" && hasStock(material)) {
      return false;
    }

    // Price filter
    if (maxPrice) {
      const maxPricePence = parseFloat(maxPrice) * 100;
      const { min } = getPriceRange(material);
      if (min > maxPricePence) return false;
    }

    return true;
  });

  // Apply sorting
  filteredMaterials.sort((a: Material, b: Material) => {
    switch (sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "price-asc":
        return getPriceRange(a).min - getPriceRange(b).min;
      case "price-desc":
        return getPriceRange(b).min - getPriceRange(a).min;
      case "options-desc":
        return b.skews.length - a.skews.length;
      default:
        return 0;
    }
  });

  const activeFiltersCount = [selectedSupplier !== "all", stockFilter !== "all", maxPrice !== ""].filter(
    Boolean,
  ).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Shop Materials</h1>
        <p className="text-muted-foreground">Browse our selection of materials available for your projects</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-3 items-end flex-wrap">
          {/* Search */}
          <InputGroup className="flex-1 min-w-[250px]">
            <Label htmlFor="search-input" className="sr-only">
              Search
            </Label>
            <InputGroupInput
              type="text"
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>

          {/* Supplier Filter */}
          <div className="w-[180px] space-y-1.5">
            <Label htmlFor="supplier-filter" className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              Supplier
            </Label>
            <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
              <SelectTrigger id="supplier-filter" size="sm">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                {suppliers.map((supplier: string) => (
                  <SelectItem key={supplier} value={supplier}>
                    {supplier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stock Filter */}
          <div className="w-[160px] space-y-1.5">
            <Label htmlFor="stock-filter" className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" />
              Stock
            </Label>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger id="stock-filter" size="sm">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Filter
          <div className="w-[140px] space-y-1.5">
            <Label htmlFor="price-filter" className="text-xs text-muted-foreground flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" />
              Max Price
            </Label>
            <Input
              id="price-filter"
              type="number"
              placeholder="Any"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              min="0"
              step="0.50"
              className="h-9"
            />
          </div> */}

          {/* Sort */}
          <div className="w-[180px] space-y-1.5">
            <Label htmlFor="sort-select" className="text-xs text-muted-foreground flex items-center gap-1.5">
              <ArrowUpDown className="h-3.5 w-3.5" />
              Sort
            </Label>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger id="sort-select" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                <SelectItem value="options-desc">Most Options</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedSupplier("all");
                setStockFilter("all");
                setMaxPrice("");
              }}
              className="h-9"
            >
              <X className="h-4 w-4 mr-1.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredMaterials.length}</span> of{" "}
          <span className="font-semibold text-foreground">{materials.length}</span> materials
        </p>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMaterials.map((material: Material) => {
          const stock = getTotalStock(material);
          const inStock = hasStock(material);

          return (
            <Link key={material.id} to="/shop/item/$id" params={material} className="group">
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100 mb-4 relative">
                    <img
                      src={`/shop/${material.icon_url}`}
                      alt={material.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {stock > 0 && (
                      <Badge variant={inStock ? "success" : "destructive"} className="absolute top-2 right-2">
                        {stock} in stock
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="line-clamp-2">{material.name}</CardTitle>
                  <CardDescription className="line-clamp-1">{material.supplier}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">{formatPriceRange(material)}</span>
                    <Badge variant="secondary">{material.skews.length} options</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No materials found matching your search.</p>
        </div>
      )}
    </div>
  );
}
