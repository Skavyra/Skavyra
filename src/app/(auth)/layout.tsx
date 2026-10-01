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

      <main className="relative flex flex-col justify-center overflow-hidden bg-[radial-gradient(ellipse_at_85%_12%,rgba(242,199,92,0.13),transparent_34%),#FBF9F4] px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm rounded-3xl border border-ink/10 bg-card/85 p-6 shadow-[0_28px_80px_-50px_rgba(13,13,13,0.35)] backdrop-blur-sm sm:p-8">
          <div className="lg:hidden">
            <Logo seam="#FBF9F4" />
          </div>
          <div className="mt-8 lg:mt-0">{children}</div>
          <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
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
