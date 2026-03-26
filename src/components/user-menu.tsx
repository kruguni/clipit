"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  Settings,
  CreditCard,
  LogOut,
  LayoutDashboard,
  Shield,
} from "lucide-react";

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="w-8 h-8 rounded-full bg-slate-700 animate-pulse" />
    );
  }

  if (!session) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/auth/signin">
          <Button variant="ghost" className="text-gray-300 hover:text-white">
            Sign In
          </Button>
        </Link>
        <Link href="/auth/signup">
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
            Get Started
          </Button>
        </Link>
      </div>
    );
  }

  const initials = session.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="w-9 h-9 border-2 border-purple-500/50 hover:border-purple-500 transition-colors cursor-pointer">
          <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || "User"} />
          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700">
        <div className="px-2 py-2">
          <p className="text-sm font-medium text-white">{session.user?.name}</p>
          <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
        </div>
        <DropdownMenuSeparator className="bg-slate-700" />
        <Link href="/dashboard">
          <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-slate-700 cursor-pointer">
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
          </DropdownMenuItem>
        </Link>
        <Link href="/profile">
          <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-slate-700 cursor-pointer">
            <User className="w-4 h-4 mr-2" />
            Profile
          </DropdownMenuItem>
        </Link>
        <Link href="/settings">
          <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-slate-700 cursor-pointer">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </DropdownMenuItem>
        </Link>
        <Link href="/billing">
          <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-slate-700 cursor-pointer">
            <CreditCard className="w-4 h-4 mr-2" />
            Billing
          </DropdownMenuItem>
        </Link>
        {session.user?.isAdmin && (
          <>
            <DropdownMenuSeparator className="bg-slate-700" />
            <Link href="/admin">
              <DropdownMenuItem className="text-emerald-400 hover:text-emerald-300 hover:bg-slate-700 cursor-pointer">
                <Shield className="w-4 h-4 mr-2" />
                Admin Dashboard
              </DropdownMenuItem>
            </Link>
          </>
        )}
        <DropdownMenuSeparator className="bg-slate-700" />
        <DropdownMenuItem
          className="text-red-400 hover:text-red-300 hover:bg-slate-700 cursor-pointer"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
