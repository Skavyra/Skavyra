"use client";

import { useEffect } from "react";

import { Mark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-[60vh] place-items-center px-6">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <Mark className="w-20" seam="#FBF9F4" />
        <h1 className="text-fluid-2xl">This page could not load</h1>
        <p className="text-sm text-muted-foreground">
          {error.message || "A request to the server failed."} Try again, and if it keeps happening, check your connection.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </main>
  );
}
