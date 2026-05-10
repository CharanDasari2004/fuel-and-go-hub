import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { NEXT_LABEL, NEXT_STATUS, STATUS_CLASS, STATUS_LABEL } from "@/lib/status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Fuel, Wrench, MapPin, Phone, CheckCircle2, Circle, Clock, Radio } from "lucide-react";

export const Route = createFileRoute("/requests")({
  component: () => (
    <AppShell>
      <RequestsPage />
    </AppShell>
  ),
});

// Customer-visible tracking timeline (skips cancelled)
const TIMELINE: { key: string; label: string }[] = [
  { key: "pending", label: "Request Placed" },
  { key: "accepted", label: "Provider Accepted" },
  { key: "on_the_way", label: "On The Way" },
  { key: "reached", label: "Reached You" },
  { key: "otp_pending", label: "OTP Verification" },
  { key: "completed", label: "Service Completed" },
];

function RequestsPage() {
  const { user, role } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const [pulse, setPulse] = useState<string | null>(null);

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
      .channel("requests-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "requests" },
        (payload) => {
          // Granular update: patch the affected row in-place when possible
          const row: any = payload.new ?? payload.old;
          if (!row) return load();
          if (payload.eventType === "DELETE") {
            setItems((prev) => prev.filter((r) => r.id !== row.id));
          } else if (payload.eventType === "INSERT") {
            setItems((prev) => [row, ...prev.filter((r) => r.id !== row.id)]);
          } else {
            setItems((prev) => prev.map((r) => (r.id === row.id ? { ...r, ...row } : r)));
          }
          setPulse(row.id);
          setTimeout(() => setPulse(null), 1500);
        },
      )
      .subscribe((status) => setLive(status === "SUBSCRIBED"));
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">
          {role === "customer" ? "My Requests" : role === "provider" ? "Service Queue" : "All Requests"}
        </h1>
        <span
          className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border ${
            live
              ? "bg-success/10 text-success border-success/30"
              : "bg-muted text-muted-foreground border-border"
          }`}
        >
          <Radio className={`h-3 w-3 ${live ? "animate-pulse" : ""}`} />
          {live ? "Live tracking active" : "Connecting…"}
        </span>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
          No requests yet.
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((r) => (
            <RequestCard
              key={r.id}
              r={r}
              role={role}
              userId={user!.id}
              onChange={load}
              pulse={pulse === r.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RequestCard({ r, role, userId, onChange, pulse }: any) {
  const [otp, setOtp] = useState("");
  const isAssignee = r.assigned_to === userId;
  const isCustomer = r.customer_id === userId;
  const next = NEXT_STATUS[r.status];
  const Icon = r.type === "fuel" ? Fuel : Wrench;

  const advance = async () => {
    const updates: any = { status: next };
    if (r.status === "pending") updates.assigned_to = userId;
    if (next === "otp_pending") {
      updates.otp_code = String(Math.floor(1000 + Math.random() * 9000));
      toast.success(`OTP sent to customer: ${updates.otp_code}`, { duration: 8000 });
    }
    const { error } = await supabase.from("requests").update(updates).eq("id", r.id);
    if (error) toast.error(error.message);
    else onChange();
  };

  const verifyOtp = async () => {
    if (otp !== r.otp_code) return toast.error("Invalid OTP");
    const { error } = await supabase
      .from("requests")
      .update({ status: "completed", otp_verified: true })
      .eq("id", r.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Service completed!");
      onChange();
    }
  };

  const cancel = async () => {
    const { error } = await supabase.from("requests").update({ status: "cancelled" }).eq("id", r.id);
    if (error) toast.error(error.message);
    else onChange();
  };

  const updated = new Date(r.updated_at ?? r.created_at);
  const ageMin = Math.max(0, Math.round((Date.now() - updated.getTime()) / 60000));

  return (
    <div
      className={`rounded-xl border bg-card p-4 transition-shadow ${
        pulse ? "border-primary shadow-lg shadow-primary/20" : "border-border"
      }`}
    >
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
              <Clock className="h-3 w-3" /> Updated {ageMin === 0 ? "just now" : `${ageMin} min ago`}
            </div>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${STATUS_CLASS[r.status]}`}>
          {STATUS_LABEL[r.status]}
        </span>
      </div>

      {/* Live tracking timeline (hidden for cancelled) */}
      {r.status !== "cancelled" && <TrackingTimeline status={r.status} />}
      {r.status === "cancelled" && (
        <div className="mt-3 text-sm text-muted-foreground italic">This request was cancelled.</div>
      )}

      <div className="mt-3 flex flex-wrap gap-2 items-center">
        {(role === "provider" || role === "admin") && next && (r.status === "pending" || isAssignee) && (
          <Button size="sm" onClick={advance}>
            {NEXT_LABEL[r.status]}
          </Button>
        )}
        {isCustomer && r.status === "otp_pending" && (
          <div className="flex gap-2 items-center flex-wrap">
            <Input
              className="w-28"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <Button size="sm" onClick={verifyOtp}>
              Verify & Complete
            </Button>
            <span className="text-xs text-muted-foreground">(Demo OTP: {r.otp_code})</span>
          </div>
        )}
        {(isCustomer || role === "admin") && !["completed", "cancelled"].includes(r.status) && (
          <Button size="sm" variant="outline" onClick={cancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

function TrackingTimeline({ status }: { status: string }) {
  const currentIdx = TIMELINE.findIndex((s) => s.key === status);
  return (
    <div className="mt-4 border-t border-border pt-4">
      <div className="flex items-start justify-between gap-2">
        {TIMELINE.map((step, i) => {
          const done = i < currentIdx;
          const current = i === currentIdx;
          return (
            <div key={step.key} className="flex-1 flex flex-col items-center text-center min-w-0">
              <div className="flex items-center w-full">
                <div className={`flex-1 h-0.5 ${i === 0 ? "bg-transparent" : done || current ? "bg-primary" : "bg-border"}`} />
                {done ? (
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                ) : current ? (
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground shrink-0">
                    <span className="h-2 w-2 rounded-full bg-primary-foreground animate-pulse" />
                  </span>
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0" />
                )}
                <div className={`flex-1 h-0.5 ${i === TIMELINE.length - 1 ? "bg-transparent" : done ? "bg-primary" : "bg-border"}`} />
              </div>
              <div
                className={`mt-1 text-[10px] leading-tight ${
                  current ? "font-semibold text-foreground" : done ? "text-foreground/70" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
