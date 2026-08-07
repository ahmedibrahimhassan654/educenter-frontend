export default function ForgotPasswordLoading() {
  return (
    <div className="min-h-screen flex">
      {/* Left side skeleton */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-4">
            <div className="h-10 w-32 bg-muted rounded animate-pulse" />
            <div className="h-8 w-40 bg-muted rounded-full animate-pulse" />
            <div className="h-10 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-5 w-56 bg-muted rounded animate-pulse" />
          </div>

          <div className="h-7 bg-muted rounded animate-pulse" />

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-12 bg-muted rounded-xl animate-pulse" />
            </div>
            <div className="h-12 bg-muted rounded-xl animate-pulse" />
          </div>
        </div>
      </div>

      {/* Right side skeleton - hidden on mobile */}
      <div className="hidden lg:flex flex-1 bg-muted animate-pulse" />
    </div>
  );
}
