import { useState } from "react";
import AppNav from "@/components/navbar/appNav";
import AppSwitcher from "@/components/navbar/appSwitcher";
import { ThemeSwitcher } from "@/components/navbar/themeSwitcher";
import { UserNav } from "@/components/navbar/userNav";
import { Menu, X } from "lucide-react";
import { Button } from "@ui/components/ui/button";

export default function NavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="sticky top-0 z-40 w-full bg-card text-card-foreground backdrop-filter shadow-lg dark:shadow-none border-b-2">
      <div className="flex items-center h-[60px] px-3 md:px-6">
        <div className="flex items-center flex-1 md:w-1/3 md:flex-none">
          <AppSwitcher />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-center flex-1 md:w-1/3">
          <AppNav />
        </div>

        <div className="flex items-center justify-end flex-1 md:w-1/3 space-x-2 md:space-x-4">
          <ThemeSwitcher />
          <UserNav />

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <AppNav />
          </div>
        </div>
      )}
    </div>
  );
}
