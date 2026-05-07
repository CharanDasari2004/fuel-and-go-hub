import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Users, Activity, CheckCircle2, Wrench } from "lucide-react";

export const Route = createFileRoute("/admin")({ component: () => <AppShell><AdminPage /></AppShell> });

function AdminPage() {
  const { role } = useAuth();
  const [data, setData] = useState({ users: 0, providers: 0, active: 0, completed: 0, profiles: [] as any[] });

  useEffect(() => {
    if (role !== "admin") return;
    (async () => {
      const [{ data: profiles }, { data: roles }, { data: reqs }] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("user_roles").select("*"),
        supabase.from("requests").select("status"),
      ]);
      setData({
        users: profiles?.length ?? 0,
        providers: (roles ?? []).filter((r) => r.role === "provider").length,
        active: (reqs ?? []).filter((r) => !["completed", "cancelled"].includes(r.status)).length,
        completed: (reqs ?? []).filter((r) => r.status === "completed").length,
        profiles: profiles ?? [],
      });
    })();
  }, [role]);

  if (role !== "admin") return <div className="text-muted-foreground">Admins only.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Panel</h1>
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat icon={Users} label="Total Users" value={data.users} />
        <Stat icon={Wrench} label="Providers" value={data.providers} />
        <Stat icon={Activity} label="Active Requests" value={data.active} />
        <Stat icon={CheckCircle2} label="Completed" value={data.completed} />
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-semibold mb-3">Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground"><tr><th className="py-2">Name</th><th>Email</th><th>Phone</th><th>Joined</th></tr></thead>
            <tbody>
              {data.profiles.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="py-2">{p.name || "—"}</td><td>{p.email}</td><td>{p.phone || "—"}</td><td>{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: any) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{label}</span><Icon className="h-4 w-4 text-primary" /></div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
    </div>
  );
}
