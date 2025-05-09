export default function PatientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="h-full flex-1 flex flex-col gap-4">{children}</div>;
}
