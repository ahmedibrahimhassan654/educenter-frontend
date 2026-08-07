"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import UserMenu from "@/components/user-menu";

export default function PublicNavActions({
  ctaHref,
  ctaLabel,
}: {
  ctaHref?: string;
  ctaLabel?: string;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const showCta = !isLoading && !isAuthenticated && ctaHref && ctaLabel;

  return (
    <>
      {showCta && (
        <Link
          href={ctaHref}
          className="hidden sm:inline-flex px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-base font-medium hover:bg-primary/90 transition-colors"
        >
          {ctaLabel}
        </Link>
      )}
      <UserMenu />
    </>
  );
}
