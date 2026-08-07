export default function StudentProgressLoading() {
  return (
    <div className="space-y-8 p-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-32 bg-muted rounded animate-pulse" />
        <div className="h-4 w-64 bg-muted rounded animate-pulse" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border rounded-xl p-5 animate-pulse">
            <div className="w-12 h-12 mx-auto rounded-xl bg-muted mb-3" />
            <div className="h-8 w-16 mx-auto bg-muted rounded mb-1" />
            <div className="h-4 w-24 mx-auto bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Groups skeleton */}
      {[1, 2].map((i) => (
        <div key={i} className="bg-card border rounded-xl overflow-hidden animate-pulse">
          <div className="p-6 border-b bg-muted/30">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-6 w-32 bg-muted rounded" />
                <div className="h-4 w-48 bg-muted rounded" />
              </div>
              <div className="flex gap-4">
                <div className="h-16 w-16 bg-muted rounded-lg" />
                <div className="h-16 w-16 bg-muted rounded-lg" />
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="h-6 w-24 bg-muted rounded mb-4" />
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
                <div key={j} className="h-20 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
