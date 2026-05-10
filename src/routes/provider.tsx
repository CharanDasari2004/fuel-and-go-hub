import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { NEXT_LABEL, NEXT_STATUS, STATUS_CLASS, STATUS_LABEL } from "@/lib/status";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Fuel, Wrench, MapPin, Phone, Activity, CheckCircle2, Clock, Inbox } from "lucide-react";

export const Route = createFileRoute("/provider")({
  component: () => (
    <AppShell>
      <ProviderDashboard />
    </AppShell>
  ),
});

function ProviderDashboard() {
  const { user, role } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from("requests")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    load();
    const ch = supabase
      .channel("provider-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "requests" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user]);

  const nearby = useMemo(() => items.filter((r) => r.status === "pending"), [items]);
  const active = useMemo(
    () =>
      items.filter(
        (r) =>
          r.assigned_to === user?.id &&
          !["completed", "cancelled", "pending"].includes(r.status),
      ),
    [items, user],
  );
  const completed = useMemo(
    () => items.filter((r) => r.assigned_to === user?.id && r.status === "completed"),
    [items, user],
  );

  if (role && role !== "provider" && role !== "admin") {
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center">
        <p className="text-muted-foreground">
          This dashboard is for service providers. Your account role is{" "}
          <span className="font-semibold capitalize">{role}</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Provider Dashboard</h1>
        <p className="text-muted-foreground">
          Accept nearby requests, update status as you go, and complete jobs with OTP.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Nearby Requests" value={nearby.length} icon={Inbox} />
        <Stat label="Active Jobs" value={active.length} icon={Activity} />
        <Stat label="Completed" value={completed.length} icon={CheckCircle2} />
      </div>

      <Section title="Nearby Requests" subtitle="Pending requests waiting for a provider" emptyText="No pending requests right now. Stay tuned!" loading={loading} items={nearby}>
        {(r) => <RequestCard key={r.id} r={r} userId={user!.id} onChange={load} mode="accept" />}
      </Section>

      <Section title="My Active Jobs" subtitle="Update status step-by-step until completion" emptyText="You haven't accepted any active jobs yet." loading={loading} items={active}>
        {(r) => <RequestCard key={r.id} r={r} userId={user!.id} onChange={load} mode="advance" />}
      </Section>

      {completed.length > 0 && (
        <Section title="Recently Completed" subtitle="Your last completed jobs" emptyText="" loading={false} items={completed.slice(0, 5)}>
          {(r) => <RequestCard key={r.id} r={r} userId={user!.id} onChange={load} mode="readonly" />}
        </Section>
      )}
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
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

function Section({
  title,
  subtitle,
  emptyText,
  loading,
  items,
  children,
}: {
  title: string;
  subtitle: string;
  emptyText: string;
  loading: boolean;
  items: any[];
  children: (r: any) => any;
}) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {loading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {emptyText}
        </div>
      ) : (
        <div className="grid gap-3">{items.map(children)}</div>
      )}
    </div>
  );
}

function RequestCard({
  r,
  userId,
  onChange,
  mode,
}: {
  r: any;
  userId: string;
  onChange: () => void;
  mode: "accept" | "advance" | "readonly";
}) {
  const next = NEXT_STATUS[r.status];
  const Icon = r.type === "fuel" ? Fuel : Wrench;
  const created = new Date(r.created_at);
  const ageMin = Math.max(0, Math.round((Date.now() - created.getTime()) / 60000));

  const advance = async () => {
    const updates: any = { status: next };
    if (r.status === "pending") updates.assigned_to = userId;
    if (next === "otp_pending") {
      updates.otp_code = String(Math.floor(1000 + Math.random() * 9000));
      toast.success(`OTP sent to customer: ${updates.otp_code}`, { duration: 8000 });
    }
    const { error } = await supabase.from("requests").update(updates).eq("id", r.id);
    if (error) toast.error(error.message);
    else {
      toast.success(`Status updated to ${STATUS_LABEL[next!]}`);
      onChange();
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <div className="font-semibold capitalize">
              {r.type} Request
              {r.fuel_quantity ? ` · ${r.fuel_quantity}L ${r.fuel_type ?? ""}` : ""}
              {r.problem_type ? ` · ${r.problem_type}` : ""}
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {r.location}
              {r.landmark ? ` (${r.landmark})` : ""}
            </div>
            {r.full_name && (
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Phone className="h-3 w-3" /> {r.full_name} · {r.phone}
              </div>
            )}
            {r.vehicle_model && (
              <div className="text-xs text-muted-foreground mt-0.5">
                Vehicle: {r.vehicle_type} · {r.vehicle_model}
              </div>
            )}
            {r.description && <div className="text-sm mt-1">{r.description}</div>}
            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3" /> {ageMin === 0 ? "Just now" : `${ageMin} min ago`}
            </div>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${STATUS_CLASS[r.status]}`}>
          {STATUS_LABEL[r.status]}
        </span>
      </div>

      {mode !== "readonly" && next && (
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <Button size="sm" onClick={advance}>
            {NEXT_LABEL[r.status]}
          </Button>
          {mode === "advance" && r.status === "otp_pending" && (
            <span className="text-xs text-muted-foreground">
              Waiting for customer to verify OTP {r.otp_code ? `(${r.otp_code})` : ""}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
