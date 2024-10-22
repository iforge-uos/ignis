import { cn, getGravatarUrl } from "@/lib/utils";
import { PartialUser } from "@ignis/types/users";
import { Avatar, AvatarFallback, AvatarImage } from "@ui/components/ui/avatar";

interface UserAvatarProps {
  user?: PartialUser | null;
  className?: string;
  draggable?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ user, className, draggable = true }) => {
  if (!user) {
    return (
      <Avatar className={cn("h-8 w-8", className)}>
        <AvatarFallback draggable={draggable}>IF</AvatarFallback>
      </Avatar>
    );
  }
  const user_initials = user.display_name
    .split(/\s|-/gm)
    .map((name) => name.charAt(0))
    .join("");
  return (
    <Avatar className={cn("h-8 w-8 rounded-md", className)}>
      <AvatarImage src={user.profile_picture || getGravatarUrl(user.email)} alt={user.email} draggable={draggable} />
      <AvatarFallback className="text-black dark:text-white">{user_initials}</AvatarFallback>
    </Avatar>
  );
};
