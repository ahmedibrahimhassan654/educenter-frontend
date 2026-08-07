export default function VerificationsLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-4 w-64 bg-muted rounded animate-pulse" />
      </div>

      {/* Filters skeleton */}
      <div className="flex gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-24 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>

      {/* List skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border rounded-xl p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-muted" />
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-muted rounded" />
                  <div className="h-4 w-48 bg-muted rounded" />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-8 w-20 bg-muted rounded-full" />
                <div className="h-8 w-24 bg-muted rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
