import { SidebarTrigger } from "@packages/ui/components/sidebar";

export const SidebarHeader = () => {
  return (
    <header className="flex h-16 shrink-0  p-3 bg-sidebar items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1 h-5 w-5" />
      </div>
    </header>
  );
};
