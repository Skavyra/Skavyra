import Link from "next/link";

import { Logo, Mark, TaglineRule } from "@/components/brand/logo";

/** Split screen: the brand on ink, the form on paper. One column on phones. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="theme-ink relative hidden flex-col justify-between overflow-hidden bg-background p-10 text-foreground lg:flex">
        <Logo />
        <div className="relative z-10">
          <h2 className="max-w-md text-fluid-3xl">Your learning partner in the digital era</h2>
          <p className="mt-4 max-w-sm text-ivory/70">
            Courses for IT and non-IT graduates, taught by mentors who work in the field.
          </p>
          <TaglineRule className="mt-8 text-gold-300" />
        </div>
        <Mark className="pointer-events-none absolute -bottom-24 -right-24 w-[34rem] opacity-20" seam="#0D0D0D" />
      </aside>

      <main className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="lg:hidden">
            <Logo seam="#FBF9F4" />
          </div>
          <div className="mt-8 lg:mt-0">{children}</div>
          <p className="mt-10 text-xs text-muted-foreground">
            By continuing you agree to our{" "}
            <Link href="/terms" className="underline hover:text-foreground">
              terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              privacy policy
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
