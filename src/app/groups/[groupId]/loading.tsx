export default function GroupDetailLoading() {
  return (
    <div className="py-16">
      <div className="h-56 bg-gradient-to-l from-indigo-500 to-violet-600">
        <div className="container py-10">
          <div className="h-5 w-32 bg-white/30 rounded animate-pulse mb-6" />
          <div className="h-8 w-64 bg-white/30 rounded animate-pulse mb-4" />
          <div className="h-12 w-full max-w-xl bg-white/40 rounded animate-pulse" />
        </div>
      </div>
      <div className="container mt-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card border rounded-2xl p-6 animate-pulse space-y-4">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-muted" />
              <div className="space-y-2 flex-1">
                <div className="h-6 w-48 bg-muted rounded" />
                <div className="h-4 w-64 bg-muted rounded" />
              </div>
            </div>
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-3/4 bg-muted rounded" />
          </div>
          <div className="bg-card border rounded-2xl p-6 animate-pulse space-y-3">
            <div className="h-6 w-48 bg-muted rounded" />
            <div className="h-10 w-full bg-muted rounded-xl" />
            <div className="h-10 w-full bg-muted rounded-xl" />
          </div>
        </div>
        <div className="bg-card border rounded-2xl p-6 animate-pulse space-y-4">
          <div className="h-6 w-40 bg-muted rounded" />
          <div className="h-16 w-full bg-muted rounded-xl" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-14 w-full bg-muted rounded-xl" />
        </div>
      </div>
    </div>
  );
}