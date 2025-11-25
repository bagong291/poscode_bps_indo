export default function ProvinsiLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="animate-pulse space-y-8">
        <div className="h-4 w-64 rounded bg-muted"></div>
        
        <div className="space-y-3">
          <div className="h-9 w-80 rounded bg-muted"></div>
          <div className="h-4 w-96 rounded bg-muted"></div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
              <div className="h-10 w-10 rounded-lg bg-muted"></div>
              <div className="h-5 flex-1 rounded bg-muted"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
