export default function DashboardLoading() {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="animate-pulse">
      <span className="sr-only">Loading dashboard</span>
      <div className="mb-6 h-16 max-w-lg rounded-xl bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-32 rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="h-56 rounded-2xl bg-muted" />
        <div className="h-56 rounded-2xl bg-muted" />
      </div>
      <div className="mt-8 h-8 w-40 rounded-lg bg-muted" />
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-64 rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
