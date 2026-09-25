import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  description,
  align = "left",
  className,
}: {
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl", className)}>
      <h2 className="text-fluid-3xl">{title}</h2>
      {description && <p className="mt-4 text-fluid-base text-muted-foreground">{description}</p>}
    </div>
  );
}
