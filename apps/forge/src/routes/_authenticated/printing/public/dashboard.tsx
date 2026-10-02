import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Hammer } from "@/components/loading";
import { orpc } from "@/lib/orpc";
import { PrinterCard } from "@/components/printing/public";

export const Route = createFileRoute("/_authenticated/printing/public/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: printers, isPending, error } = useQuery(orpc.print.public.printers.queryOptions());

  if (isPending)
    return (
      <div className="flex justify-center p-6">
        <Hammer />
      </div>
    );
  if (error) return <div className="p-6">Failed to load printers: {error.message}</div>;

  return (
    <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
      {printers.map(({ printer, status }) => (
        <Link
          key={printer.id}
          to="/printing/public/printer/$name"
          params={{ name: printer.name }}
          className="group flex flex-col gap-3 rounded-xl border p-4 transition hover:border-primary hover:shadow-md"
        >
          <PrinterCard printer={printer} status={status} />
        </Link>
      ))}
    </div>
  );
}
