import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const roleDashboards: Record<string, string> = {
  ADMIN: "/admin",
  TEACHER: "/teacher",
  STUDENT: "/student",
  PARENT: "/parent",
};

async function resolveDestination(accessToken: string): Promise<string> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    if (!response.ok) return "/";

    const profile = await response.json();

    if (profile?.role === "TEACHER" && profile?.verificationStatus !== "VERIFIED") {
      return "/teacher/verification";
    }

    return roleDashboards[profile?.role] || "/";
  } catch {
    return "/";
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const accessToken = data.session?.access_token;
      const destination = accessToken
        ? await resolveDestination(accessToken)
        : "/";
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login`);
}
