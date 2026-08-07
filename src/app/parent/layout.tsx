import RoleGuard from "@/components/role-guard";

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGuard role="PARENT">{children}</RoleGuard>;
}
