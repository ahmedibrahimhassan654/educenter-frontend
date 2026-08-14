export default function TeacherProfileLoading() {
  return (
    <div className="py-16">
      <div className="h-72 bg-gradient-to-br from-indigo-600 to-violet-600">
        <div className="container py-12">
          <div className="h-5 w-32 bg-white/30 rounded animate-pulse mb-10" />
          <div className="flex items-center gap-6">
            <div className="w-28 h-28 rounded-3xl bg-white/30 animate-pulse" />
            <div className="space-y-3 flex-1">
              <div className="h-10 w-64 bg-white/30 rounded animate-pulse" />
              <div className="h-5 w-96 max-w-full bg-white/20 rounded animate-pulse" />
              <div className="h-4 w-48 bg-white/20 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
      <div className="container mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border rounded-2xl p-6 animate-pulse">
              <div className="h-8 w-24 bg-muted rounded" />
            </div>
          ))}
        </div>
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border bg-card p-5 space-y-4 animate-pulse">
              <div className="h-2 w-1/3 bg-muted rounded-full" />
              <div className="h-6 w-2/3 bg-muted rounded-full" />
              <div className="h-2.5 w-full bg-muted rounded-full" />
              <div className="h-11 w-full bg-muted rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}