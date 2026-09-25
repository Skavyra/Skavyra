"use client";

import { LogOut, Menu, User } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

import { signOut } from "@/actions/profile";
import { Logo } from "@/components/brand/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { NavItem } from "@/lib/constants";
import { initials } from "@/lib/utils";

import { SidebarNav } from "./Sidebar";

export function Topbar({
  items,
  title,
  name,
  email,
  avatarUrl,
  profileHref,
}: {
  items: NavItem[];
  title: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  profileHref?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b bg-background/95 px-4 backdrop-blur lg:h-16 lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
              <Menu className="!size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="theme-ink bg-background p-4 text-foreground">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="px-2 pb-4 pt-2">
              <Logo />
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-gold-300">{title}</p>
            </div>
            <SidebarNav items={items} onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <span className="truncate font-display text-base font-bold lg:hidden">{title}</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full p-0.5 pr-2 hover:bg-muted" aria-label="Account menu">
            <Avatar className="size-8">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
              <AvatarFallback>{initials(name || email)}</AvatarFallback>
            </Avatar>
            <span className="hidden max-w-[10rem] truncate text-sm font-semibold sm:block">{name || email}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-56">
          <DropdownMenuLabel className="truncate">{email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {profileHref && (
            <DropdownMenuItem asChild>
              <Link href={profileHref}>
                <User /> Profile
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href="/">Visit the website</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={pending}
            onSelect={(e) => {
              e.preventDefault();
              start(async () => {
                await signOut();
                window.location.href = "/login";
              });
            }}
          >
            <LogOut /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
