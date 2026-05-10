import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ReactNode } from "react";
import { Fuel, Wrench, LogOut, LayoutDashboard, ListChecks, Shield, User as UserIcon } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, role, signOut, loading } = useAuth();
  const nav = useNavigate();
  const { location } = useRouterState();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  }

  if (!user) {
    if (typeof window !== "undefined") nav({ to: "/login" });
    return null;
  }

  const NavLink = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          active ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:bg-secondary"
        }`}
      >
        <Icon className="h-4 w-4" />
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Fuel className="h-4 w-4" />
            </span>
            RoadAid
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden sm:inline text-muted-foreground">
              {user.email} · <span className="font-medium capitalize text-foreground">{role}</span>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await signOut();
                nav({ to: "/login" });
              }}
            >
              <LogOut className="h-4 w-4 mr-1" /> Sign out
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <aside className="space-y-1">
          <NavLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          {role === "customer" && (
            <>
              <NavLink to="/request/new" icon={Fuel} label="New Request" />
              <NavLink to="/requests" icon={ListChecks} label="My Requests" />
            </>
          )}
          {role === "provider" && (
            <>
              <NavLink to="/provider" icon={LayoutDashboard} label="Provider Dashboard" />
              <NavLink to="/requests" icon={Wrench} label="Service Queue" />
            </>
          )}
          {role === "admin" && (
            <>
              <NavLink to="/requests" icon={ListChecks} label="All Requests" />
              <NavLink to="/admin" icon={Shield} label="Admin Panel" />
            </>
          )}
          <NavLink to="/profile" icon={UserIcon} label="Profile" />
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
