import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Hammer } from "@/components/loading";
import { PrinterCard } from "@/components/printing/public";
import { orpc } from "@/lib/orpc";
import * as z from "zod";

export const Route = createFileRoute("/_authenticated/printing/public/printer/$name")({
  component: RouteComponent,
  params: {
    parse: z.object({
      name: z.string().min(1),
    }).parse,
  },
});

function RouteComponent() {
  const { name } = Route.useParams();
  const { data, isPending, error } = useQuery({
    ...orpc.print.public.printer.queryOptions({ input: { name } }),
    refetchInterval: 5000,
  });

  if (isPending)
    return (
      <div className="flex justify-center p-6">
        <Hammer />
      </div>
    );
  if (error) return <div className="p-6">Failed to load printer: {error.message}</div>;

  return (
    <div className="p-6">
      <div className="flex w-full flex-col gap-3 rounded-xl border p-4">
        <PrinterCard printer={data.printer} status={data.status} />
      </div>
    </div>
  );
}
