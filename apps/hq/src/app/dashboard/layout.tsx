import { AuthGuard } from "@/components/AuthGuard";
import { DashboardNav } from "@/components/DashboardNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <DashboardNav />
        <main className="flex-1 overflow-y-auto bg-muted/10">
          <div className="mx-auto max-w-6xl p-8">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
