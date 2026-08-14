"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { DynamicThemeToggle } from "@/lib/dynamic-imports";
import PublicNavActions from "@/components/public-nav-actions";

const NAV_LINKS = [
  { href: "/", label: "الرئيسية", key: "home" },
  { href: "/groups", label: "المجموعات", key: "groups" },
  { href: "/for-teachers", label: "للمعلمين", key: "teachers" },
  { href: "/for-parents", label: "لأولياء الأمور", key: "parents" },
  { href: "/for-students", label: "للطلاب", key: "students" },
];

export default function PublicHeader({
  active,
  ctaHref,
  ctaLabel,
}: {
  active?: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b bg-background/95 backdrop-blur-md sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="شعار المنصة" width={40} height={40} priority />
          <span className="text-xl font-bold text-primary">إديو سنتر</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={`text-base font-medium transition-colors ${
                active === link.key
                  ? "text-primary font-semibold"
                  : "hover:text-primary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <DynamicThemeToggle />
          <div className="hidden sm:block">
            <PublicNavActions ctaHref={ctaHref} ctaLabel={ctaLabel} />
          </div>
          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="القائمة"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  active === link.key
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t mt-2">
              <PublicNavActions ctaHref={ctaHref} ctaLabel={ctaLabel} />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}