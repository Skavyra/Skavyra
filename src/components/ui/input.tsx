"use client";

import { Eye, EyeOff } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const base =
  "flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:border-gold-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive";

/** Every type="password" input gets a show/hide eye, so no form has to remember to add one. */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({ className, type, ...props }, ref) => {
  const [shown, setShown] = React.useState(false);

  if (type === "password") {
    return (
      <div className="relative w-full">
        <input type={shown ? "text" : "password"} ref={ref} className={cn(base, "pr-10", className)} {...props} />
        <button
          type="button"
          tabIndex={-1}
          aria-label={shown ? "Hide password" : "Show password"}
          onClick={() => setShown((v) => !v)}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
        >
          {shown ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    );
  }

  return <input type={type} ref={ref} className={cn(base, className)} {...props} />;
});
Input.displayName = "Input";

export { Input };
