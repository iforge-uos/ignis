import { cn, getGravatarUrl } from "@/lib/utils";
import { PartialUser } from "@ignis/types/users";
import { Avatar, AvatarFallback, AvatarImage } from "@ui/components/ui/avatar";

interface UserAvatarProps {
  user?: PartialUser | null;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ user, className }) => {
  if (!user) {
    return (
      <Avatar className={cn("h-8 w-8", className)}>
        <AvatarFallback>IF</AvatarFallback>
      </Avatar>
    );
  }
  const user_initials = user.display_name
    .split(/\s|-/gm)
    .map((name) => name.charAt(0))
    .join("");
  return (
    <Avatar className={cn("h-8 w-8 rounded-md", className)}>
      <AvatarImage src={user.profile_picture || getGravatarUrl(user.email)} alt={user.email} />
      <AvatarFallback>{user_initials}</AvatarFallback>
    </Avatar>
  );
};
