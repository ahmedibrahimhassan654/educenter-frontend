export function generateStaticParams() {
  return [{ groupId: "placeholder" }];
}

export default function GroupDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}