export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="animate-pulse space-y-8">
        {/* Breadcrumb skeleton */}
        <div className="h-4 w-64 rounded bg-muted"></div>
        
        {/* Title skeleton */}
        <div className="space-y-3">
          <div className="h-8 w-96 rounded bg-muted"></div>
          <div className="h-4 w-64 rounded bg-muted"></div>
        </div>

        {/* Content skeleton */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg border bg-card"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
