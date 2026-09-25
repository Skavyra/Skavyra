import Link from "next/link";

import { Mark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="theme-ink grid min-h-dvh place-items-center bg-background px-6 text-foreground">
      <div className="flex max-w-md flex-col items-center gap-5 text-center">
        <Mark className="w-24" />
        <h1 className="text-fluid-3xl">This page does not exist</h1>
        <p className="text-muted-foreground">The link may be old or mistyped. Head back home or browse the courses.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild variant="gold">
            <Link href="/">Go home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/courses">Browse courses</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
