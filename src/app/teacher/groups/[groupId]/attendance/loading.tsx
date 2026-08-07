export default function AttendanceLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-muted rounded-lg animate-pulse" />
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border rounded-xl p-4 animate-pulse">
            <div className="h-8 w-16 mx-auto bg-muted rounded mb-1" />
            <div className="h-4 w-24 mx-auto bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-card border rounded-xl overflow-hidden animate-pulse">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <div className="h-6 w-32 bg-muted rounded" />
            <div className="h-10 w-32 bg-muted rounded-lg" />
          </div>
        </div>
        <div className="divide-y">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-3 w-24 bg-muted rounded" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-20 bg-muted rounded-lg" />
                <div className="h-8 w-20 bg-muted rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
