export default function ForParentsLoading() {
  return (
    <div className="space-y-16 py-16">
      {/* Hero skeleton */}
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="h-12 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-6 w-full bg-muted rounded animate-pulse" />
            <div className="h-6 w-2/3 bg-muted rounded animate-pulse" />
            <div className="h-12 w-40 bg-muted rounded-lg animate-pulse" />
          </div>
          <div className="h-80 bg-muted rounded-2xl animate-pulse" />
        </div>
      </div>

      {/* Features skeleton */}
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="h-8 w-48 mx-auto bg-muted rounded animate-pulse" />
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border rounded-xl p-6 animate-pulse">
              <div className="w-12 h-12 rounded-xl bg-muted mb-4" />
              <div className="h-6 w-32 bg-muted rounded mb-2" />
              <div className="h-4 w-full bg-muted rounded" />
              <div className="h-4 w-3/4 bg-muted rounded mt-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
