import AppSwitcher from "@/components/navbar/appSwitcher";
import { ThemeSwitcher } from "@/components/navbar/themeSwitcher";
import { UserNav } from "@/components/navbar/userNav";
import AppNav from "@/components/navbar/appNav";

export default function NavBar() {
  return (
    <div className="flex items-center justify-between h-[60px] p-3 w-full bg-card text-card-foreground backdrop-filter shadow-lg dark:shadow-none">
      <div className="flex flex-1">
        <AppSwitcher />
      </div>
      <div className="flex-1 text-center">
        <AppNav />
      </div>
      <div className="flex flex-1 justify-end pr-1">
        <div className="flex items-center space-x-4">
          <ThemeSwitcher />
          <UserNav />
        </div>
      </div>
    </div>
  );
}
