export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ padding: '30px' }}>
      {children}
    </div>
  );
}
