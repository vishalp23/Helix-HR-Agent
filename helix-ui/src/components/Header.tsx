import React from 'react';
import { Sun, Moon, Settings, HelpCircle, UserCircle } from 'lucide-react'; // Removed Laptop icon as it's not used in the provided code
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from '../theme-provider';

// No props needed for this version of Header
// interface HeaderProps {}

const Header: React.FC = () => {
  const { setTheme } = useTheme();

  const headerClasses = "h-16 flex items-center justify-between px-4 md:px-6 border-b bg-card/95 backdrop-blur-sm text-foreground";

  return (
    <header className={headerClasses}>
      {/* Logo and Title Section */}
      <div className="flex items-center gap-2">
        <Avatar>
          {/* Assuming AvatarImage might be used later, for now Fallback is primary */}
          {/* <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" /> */}
          <AvatarFallback className="bg-primary text-primary-foreground font-semibold">H</AvatarFallback>
        </Avatar>
        <h1 className="text-lg font-semibold">Helix</h1> {/* Ensured text-foreground is inherited or explicitly set if needed */}
      </div>

      {/* Navigation Actions Section */}
      <nav className="flex items-center gap-3">
        {/* Theme Toggle Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Help Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <HelpCircle className="h-5 w-5" />
              <span className="sr-only">Help</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>How to use Helix</DropdownMenuItem>
            <DropdownMenuItem>About Helix HR Agent</DropdownMenuItem>
            <DropdownMenuItem>Contact Support</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile Settings</DropdownMenuItem>
            <DropdownMenuItem>Notification Preferences</DropdownMenuItem>
            <DropdownMenuItem>Theme Settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Icon */}
        {/* For now, a simple button. Could be a dropdown for profile actions later. */}
        <Button variant="ghost" size="icon">
          <UserCircle className="h-5 w-5" />
          <span className="sr-only">User Profile</span>
        </Button>
      </nav>
    </header>
  );
};

export default Header;
