import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlayCircle, Heart, Settings, LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/auth-provider";

const AvatarDropdown = () => {
  const { user, logout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-transform hover:scale-105 active:scale-95 duration-200">
          <Avatar className="h-8 w-8 sm:h-9 sm:w-9 ring-2 ring-border hover:ring-primary/50 transition-all duration-200">
            <AvatarImage src={user.avatar} alt={user.name || user.username} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
              {user.name?.charAt(0) || user.username?.charAt(0) || 'G'}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 sm:w-72 bg-popover border-border text-popover-foreground shadow-xl"
        sideOffset={8}
      >
        {/* User Info */}
        <DropdownMenuLabel className="space-y-1 p-3">
          <p className="text-sm font-semibold leading-none text-foreground">{user.name || user.username}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-border" />

        <DropdownMenuItem className="cursor-pointer focus:bg-accent focus:text-accent-foreground transition-colors duration-150 p-2.5 mx-1 rounded-lg">
          <Link to="/profile" className="flex items-center gap-3 w-full">
            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
              <User className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Profile</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border" />

        {/* Continue Watching */}
        <DropdownMenuItem className="cursor-pointer focus:bg-accent focus:text-accent-foreground transition-colors duration-150 p-2.5 mx-1 rounded-lg">
          <Link to="/continue-watching" className="flex items-center gap-3 w-full">
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <PlayCircle className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Continue Watching</span>
          </Link>
        </DropdownMenuItem>

        {/* Watchlist */}
        <DropdownMenuItem className="cursor-pointer focus:bg-accent focus:text-accent-foreground transition-colors duration-150 p-2.5 mx-1 rounded-lg">
          <Link to="/watchlist" className="flex items-center gap-3 w-full">
            <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Heart className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Watchlist</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border" />

        {/* Settings */}
        <DropdownMenuItem className="cursor-pointer focus:bg-accent focus:text-accent-foreground transition-colors duration-150 p-2.5 mx-1 rounded-lg">
          <Link to="/settings" className="flex items-center gap-3 w-full">
            <div className="p-1.5 rounded-md bg-slate-500/10 text-slate-600 dark:text-slate-400">
              <Settings className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border" />

        {/* Logout */}
        <DropdownMenuItem
          className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/30 transition-colors duration-150 p-2.5 mx-1 rounded-lg"
          onClick={logout}
        >
          <div className="flex items-center gap-3 w-full">
            <div className="p-1.5 rounded-md bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
              <LogOut className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Logout</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AvatarDropdown;