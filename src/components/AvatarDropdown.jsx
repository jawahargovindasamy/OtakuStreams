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

  const {user} = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="rounded-full outline-black outline focus:ring-2 focus:ring-ring cursor-pointer">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        {/* User Info */}
        <DropdownMenuLabel className="space-y-1">
          <p className="text-sm font-medium leading-none">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="cursor-pointer">
          <Link to="/profile" className="flex items-center gap-2 w-full">
            <User className="h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Continue Watching */}
        <DropdownMenuItem className="cursor-pointer">
          <Link to="/continue-watching" className="flex items-center gap-2 w-full">
            <PlayCircle className="h-4 w-4" />
            Continue Watching
          </Link>
        </DropdownMenuItem>

        {/* Watchlist */}
        <DropdownMenuItem className="cursor-pointer">
          <Link to="/watchlist" className="flex items-center gap-2 w-full">
            <Heart className="h-4 w-4" />
            Watchlist
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Settings */}
        <DropdownMenuItem className=" cursor-pointer">
          <Link to="/settings" className="flex items-center gap-2 w-full">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={() => console.log("Logout")}
        >
          <Link to="/logout" className="flex items-center gap-2 w-full">
            <LogOut className="h-4 w-4" />
            Logout
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AvatarDropdown;
