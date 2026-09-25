import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
  /** Hidden in the mobile card, e.g. when it repeats the title. */
  hideOnCard?: boolean;
};

/**
 * One definition, two layouts: a table from md up, stacked cards below, which
 * is how the admin screens are meant to behave on a phone.
 */
export function DataTable<T>({
  rows,
  columns,
  rowKey,
  cardTitle,
  onRowHref,
  empty,
  selection,
}: {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  cardTitle?: (row: T) => React.ReactNode;
  onRowHref?: (row: T) => string;
  empty?: React.ReactNode;
  selection?: { render: (row: T) => React.ReactNode; header?: React.ReactNode };
}) {
  if (rows.length === 0 && empty) return <>{empty}</>;

  return (
    <>
      <div className="hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {selection && <TableHead className="w-10">{selection.header}</TableHead>}
              {columns.map((c) => (
                <TableHead key={c.key} className={c.className}>
                  {c.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const href = onRowHref?.(row);
              return (
                <TableRow key={rowKey(row)} className={cn(href && "cursor-pointer")}>
                  {selection && <TableCell className="w-10">{selection.render(row)}</TableCell>}
                  {columns.map((c, i) => (
                    <TableCell key={c.key} className={c.className}>
                      {href && i === 0 ? (
                        <a href={href} className="block font-semibold hover:underline">
                          {c.cell(row)}
                        </a>
                      ) : (
                        c.cell(row)
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ul className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => {
          const href = onRowHref?.(row);
          const title = cardTitle?.(row) ?? columns[0].cell(row);
          return (
            <li key={rowKey(row)} className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 font-semibold">
                  {href ? (
                    <a href={href} className="hover:underline">
                      {title}
                    </a>
                  ) : (
                    title
                  )}
                </div>
                {selection && <div className="shrink-0">{selection.render(row)}</div>}
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {columns.slice(1).map((c) =>
                  c.hideOnCard ? null : (
                    <div key={c.key} className="min-w-0">
                      <dt className="text-xs text-muted-foreground">{c.header}</dt>
                      <dd className="truncate">{c.cell(row)}</dd>
                    </div>
                  ),
                )}
              </dl>
            </li>
          );
        })}
      </ul>
    </>
  );
}
