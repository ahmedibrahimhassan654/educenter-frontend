import RoleGuard from "@/components/role-guard";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGuard role="TEACHER">{children}</RoleGuard>;
}
