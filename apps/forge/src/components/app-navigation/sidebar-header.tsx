import { Banner, BannerAction, BannerClose, BannerIcon, BannerTitle } from "@packages/ui/components/banner";
import { SidebarTrigger } from "@packages/ui/components/sidebar";
import { CircleAlert } from "lucide-react";
import { cn, clamp } from "@/lib/utils";
import { orpc } from "@/lib/orpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userAtom } from "@/atoms/authSessionAtoms";
import { useAtom } from "jotai";

export const SidebarHeader = () => {
  const [user, setUser] = useAtom(userAtom);
  const queryClient = useQueryClient();
  const announcements = (user?.notifications ?? []).filter(n => !n["@acknowledged_at"] && n.delivery_methods.includes("BANNER"));
  const setNotifications = (notifications: (typeof primaryNotification)[]) => setUser({ ...user, notifications });

  const primaryNotification = announcements[0];
  const { mutate: acknowledge } = useMutation(
    orpc.notifications.acknowledge.mutationOptions({
      onSuccess: (notification) => {
        setNotifications(announcements.filter((current) => current.id !== notification.id));
        queryClient.invalidateQueries( {queryKey: orpc.users.me.queryKey()} )
      },
    }),
  );

  return (
    <header
      className="shrink-0 bg-background items-center"
      style={{ height: 56 * clamp(announcements.length, 1, announcements.length) }}
    >
      <div className="flex h-14 items-center">
        <SidebarTrigger
          className={cn(
            "h-6 w-6 z-10 mx-4 hover:cursor-pointer",
            announcements.length ? "text-white bg-primary" : "text-current hover:bg-accent",
          )}
          variant={announcements.length ? undefined : "ghost"}
        />
        {primaryNotification && (
          <Banner className="absolute">
            <div className="ml-6" />
            <BannerIcon icon={CircleAlert} />
            <BannerTitle>{primaryNotification.title}</BannerTitle>
            <BannerAction>Read more</BannerAction>
            <BannerClose onClick={() => acknowledge(primaryNotification)} />
          </Banner>
        )}
      </div>

      {announcements.slice(1).map((notification) => (
        <Banner className="border-t" key={notification.id}>
          <BannerIcon icon={CircleAlert} />
          <BannerTitle>{notification.title}</BannerTitle>
          <BannerAction>Read more</BannerAction>
          <BannerClose onClick={() => acknowledge(notification)} />
        </Banner>
      ))}
    </header>
  );
};
