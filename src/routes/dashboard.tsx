import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_CLASS, STATUS_LABEL } from "@/lib/status";
import { Fuel, Wrench, ListChecks, ShieldAlert, User as UserIcon, Activity } from "lucide-react";

export const Route = createFileRoute("/dashboard")({ component: DashboardPage });

function DashboardPage() {
  return (
    <AppShell>
      <DashboardInner />
    </AppShell>
  );
}

function DashboardInner() {
  const { user, role } = useAuth();
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 });
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("requests").select("*").order("created_at", { ascending: false }).limit(50);
      const list = data ?? [];
      setRecent(list.slice(0, 5));
      setStats({
        total: list.length,
        active: list.filter((r) => !["completed", "cancelled"].includes(r.status)).length,
        completed: list.filter((r) => r.status === "completed").length,
      });
    })();
  }, [user]);

  const cards =
    role === "customer"
      ? [
          { to: "/request/new", icon: Fuel, title: "Request Fuel Delivery", desc: "Petrol or diesel delivered to your location" },
          { to: "/request/mechanic", icon: Wrench, title: "Request Mechanic", desc: "Puncture, battery, engine & more" },
          { to: "/requests", icon: ListChecks, title: "My Requests", desc: "Track active and past requests" },
          { to: "/profile", icon: UserIcon, title: "Profile Settings", desc: "Update your contact info" },
        ]
      : role === "provider"
      ? [
          { to: "/requests", icon: Wrench, title: "Service Queue", desc: "View and accept nearby requests" },
          { to: "/profile", icon: UserIcon, title: "Profile", desc: "Manage your provider profile" },
        ]
      : [
          { to: "/requests", icon: ListChecks, title: "All Requests", desc: "Monitor every request on the platform" },
          { to: "/admin", icon: ShieldAlert, title: "Admin Panel", desc: "Manage users and providers" },
        ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""} 👋</h1>
        <p className="text-muted-foreground capitalize">{role} dashboard</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Requests" value={stats.total} icon={Activity} />
        <StatCard label="Active" value={stats.active} icon={Fuel} />
        <StatCard label="Completed" value={stats.completed} icon={ListChecks} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="group rounded-xl border border-border bg-card p-5 hover:border-primary/60 hover:shadow-md transition"
          >
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
                <c.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold group-hover:text-primary transition">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {recent.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold mb-3">Recent activity</h2>
          <ul className="space-y-2">
            {recent.map((r) => (
              <li key={r.id} className="flex items-center justify-between text-sm border-b border-border last:border-0 pb-2 last:pb-0">
                <div>
                  <span className="font-medium capitalize">{r.type}</span>
                  <span className="text-muted-foreground"> · {r.location}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs ${STATUS_CLASS[r.status]}`}>{STATUS_LABEL[r.status]}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
    </div>
  );
}
