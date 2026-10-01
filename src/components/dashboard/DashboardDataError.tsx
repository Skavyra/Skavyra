"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function DashboardDataError() {
  const router = useRouter();

  return (
    <section role="alert" className="rounded-2xl border border-destructive/20 bg-card p-6 sm:p-8">
      <h1 className="font-display text-xl font-bold">Your dashboard could not load</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Your course and learning information is temporarily unavailable. Try again to reload your latest data.
      </p>
      <Button className="mt-5" variant="outline" onClick={() => router.refresh()}>
        Try again
      </Button>
    </section>
  );
}
