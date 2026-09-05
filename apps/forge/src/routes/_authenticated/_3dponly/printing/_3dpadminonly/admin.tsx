import { createFileRoute } from "@tanstack/react-router";
import { ClipboardCheckIcon, FilePenIcon, PowerOffIcon, UserKeyIcon, WrenchIcon } from "lucide-react";
import { HubPage, type HubSection } from "@/components/printing/hubs";

export const Route = createFileRoute("/_authenticated/_3dponly/printing/_3dpadminonly/admin")({
  component: RouteComponent,
});

const SECTIONS: HubSection[] = [
  {
    title: "Review",
    description: "Approve or reject prints under review.",
    icon: ClipboardCheckIcon,
    accent: "bg-amber-500/10 text-amber-600",
    links: [{ label: "Prints for review", to: "/printing/review" }],
  },
  {
    title: "Edit",
    description: "Edit prints or update printers.",
    icon: FilePenIcon,
    accent: "bg-blue-500/10 text-blue-600",
    links: [{ label: "Edit prints & printers", to: "/printing/edit" }],
  },
  {
    title: "Availability",
    description: "Take printers out of service or bring them back.",
    icon: PowerOffIcon,
    accent: "bg-red-500/10 text-red-600",
    links: [{ label: "Disable, add or remove printers", to: "/printing/disable" }],
  },
  {
    title: "Downtime",
    description: "Log maintenance windows and inspect printer downtime.",
    icon: WrenchIcon,
    accent: "bg-violet-500/10 text-violet-600",
    links: [{ label: "Printer downtime", to: "/printing/downtime" }],
  },
];

function RouteComponent() {
  return <HubPage title="3DP admin hub." icon={UserKeyIcon} sections={SECTIONS} />;
}
