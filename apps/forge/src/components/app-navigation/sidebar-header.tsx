import { SidebarTrigger } from "@packages/ui/components/sidebar";

export const SidebarHeader = () => {
  return (
    <header className="flex h-12 shrink-0 px-4 py-2 bg-background items-center gap-2">
      <SidebarTrigger className="h-6 w-6" />
    </header>
  );
};
