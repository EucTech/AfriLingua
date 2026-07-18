export default function DashboardPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground text-sm">
        This is the shared dashboard shell (sidebar + header). Add real pages under{" "}
        <code>app/(app)/&lt;route&gt;</code>.
      </p>
    </div>
  );
}
