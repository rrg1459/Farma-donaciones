export function DashboardHeaderLoading() {
  return (
    <>
      <header className="sticky top-0 z-10 bg-primary p-3 text-white shadow-md sm:p-4">
        <div className="mx-auto flex h-10 max-w-7xl items-center">
          <span className="font-bold">FarmaDonaciones</span>
        </div>
      </header>
      <nav
        aria-label="Cargando navegación"
        className="border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6 lg:px-8"
      >
        <div className="mx-auto flex h-12 max-w-7xl items-center gap-8">
          <span className="h-4 w-20 animate-pulse rounded bg-slate-200" />
          <span className="h-4 w-32 animate-pulse rounded bg-slate-200" />
          <span className="h-4 w-20 animate-pulse rounded bg-slate-200" />
          <span className="h-4 w-28 animate-pulse rounded bg-slate-200" />
        </div>
      </nav>
    </>
  );
}

export default function DashboardLoading() {
  return (
    <DashboardHeaderLoading />
  );
}
