import type { LucideIcon } from "lucide-react";

/** Empty screens invite an action rather than apologise. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
      {Icon && (
        <span className="grid size-11 place-items-center rounded-xl bg-muted">
          <Icon className="size-5 text-gold-700" />
        </span>
      )}
      <p className="font-display text-lg font-bold">{title}</p>
      {description && <p className="max-w-md text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
