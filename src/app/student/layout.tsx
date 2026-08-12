import RoleGuard from "@/components/role-guard";
import OnboardingGuard from "@/components/onboarding-guard";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard role="STUDENT">
      <OnboardingGuard>
        {children}
      </OnboardingGuard>
    </RoleGuard>
  );
}
