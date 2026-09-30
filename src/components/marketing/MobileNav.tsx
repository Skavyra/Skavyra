"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function MobileNav({ links, home }: { links: { href: string; label: string }[]; home: string | null }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="!size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="theme-ink bg-background p-6 text-foreground">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <Logo />
        <nav aria-label="Mobile" className="mt-6 flex flex-col">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="border-b border-border py-4 text-lg font-semibold transition-colors hover:pl-2 hover:text-gold-100"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-3">
          {home ? (
            <Button asChild variant="gold" size="lg">
              <Link href={home}>Go to dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="gold" size="lg">
                <Link href="/signup">Get started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">Log in</Link>
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
