export default function GroupsLoading() {
  return (
    <div className="py-16">
      {/* Hero skeleton */}
      <div className="h-64 bg-gradient-to-br from-indigo-600 to-violet-600">
        <div className="container py-16">
          <div className="h-6 w-48 bg-white/30 rounded-full animate-pulse mx-auto mb-6" />
          <div className="h-12 w-96 max-w-full bg-white/30 rounded animate-pulse mx-auto mb-4" />
          <div className="h-5 w-72 max-w-full bg-white/20 rounded animate-pulse mx-auto mb-8" />
          <div className="h-14 w-full max-w-2xl bg-white/40 rounded-2xl animate-pulse mx-auto" />
        </div>
      </div>

      <div className="container">
        <div className="mt-8 h-20 bg-card border rounded-2xl animate-pulse" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border bg-card p-5 space-y-4 animate-pulse">
              <div className="h-2 w-1/3 bg-muted rounded-full" />
              <div className="h-6 w-2/3 bg-muted rounded-full" />
              <div className="h-4 w-1/2 bg-muted rounded-full" />
              <div className="h-2.5 w-full bg-muted rounded-full" />
              <div className="h-11 w-full bg-muted rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}