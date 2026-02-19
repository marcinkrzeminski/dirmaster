"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { db } from "@/lib/db";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "ui";
import { LayoutDashboard, FolderOpen, LogOut } from "lucide-react";
import { cn } from "ui";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/projects", label: "Projects", icon: FolderOpen },
];

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useCurrentUser();

  async function handleLogout() {
    await db.auth.signOut();
    router.replace("/login");
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <span className="text-lg font-semibold">DirMaster HQ</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t p-4">
        <div className="mb-3 px-3 text-sm text-muted-foreground">
          {user?.email}
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
