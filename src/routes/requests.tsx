import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { NEXT_LABEL, NEXT_STATUS, STATUS_CLASS, STATUS_LABEL } from "@/lib/status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Fuel, Wrench, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/requests")({ component: () => <AppShell><RequestsPage /></AppShell> });

function RequestsPage() {
  const { user, role } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("requests").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    load();
    const ch = supabase
      .channel("requests-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "requests" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{role === "customer" ? "My Requests" : role === "provider" ? "Service Queue" : "All Requests"}</h1>
      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">No requests yet.</div>
      ) : (
        <div className="grid gap-3">
          {items.map((r) => <RequestCard key={r.id} r={r} role={role} userId={user!.id} onChange={load} />)}
        </div>
      )}
    </div>
  );
}

function RequestCard({ r, role, userId, onChange }: any) {
  const [otp, setOtp] = useState("");
  const isAssignee = r.assigned_to === userId;
  const isCustomer = r.customer_id === userId;
  const next = NEXT_STATUS[r.status];

  const advance = async () => {
    const updates: any = { status: next };
    if (r.status === "pending") updates.assigned_to = userId;
    if (next === "otp_pending") {
      updates.otp_code = String(Math.floor(1000 + Math.random() * 9000));
      toast.success(`OTP sent to customer: ${updates.otp_code}`, { duration: 8000 });
    }
    const { error } = await supabase.from("requests").update(updates).eq("id", r.id);
    if (error) toast.error(error.message); else onChange();
  };

  const verifyOtp = async () => {
    if (otp !== r.otp_code) return toast.error("Invalid OTP");
    const { error } = await supabase.from("requests").update({ status: "completed", otp_verified: true }).eq("id", r.id);
    if (error) toast.error(error.message); else { toast.success("Service completed!"); onChange(); }
  };

  const cancel = async () => {
    const { error } = await supabase.from("requests").update({ status: "cancelled" }).eq("id", r.id);
    if (error) toast.error(error.message); else onChange();
  };

  const Icon = r.type === "fuel" ? Fuel : Wrench;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
          <div>
            <div className="font-semibold capitalize">{r.type} Request {r.fuel_quantity ? `· ${r.fuel_quantity}L ${r.fuel_type ?? ""}` : ""}{r.problem_type ? ` · ${r.problem_type}` : ""}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {r.location}{r.landmark ? ` (${r.landmark})` : ""}</div>
            {r.full_name && <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" /> {r.full_name} · {r.phone}</div>}
            {r.description && <div className="text-sm mt-1">{r.description}</div>}
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${STATUS_CLASS[r.status]}`}>{STATUS_LABEL[r.status]}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 items-center">
        {/* Provider workflow */}
        {(role === "provider" || role === "admin") && next && (r.status === "pending" || isAssignee) && (
          <Button size="sm" onClick={advance}>{NEXT_LABEL[r.status]}</Button>
        )}
        {/* Customer OTP entry */}
        {isCustomer && r.status === "otp_pending" && (
          <div className="flex gap-2 items-center">
            <Input className="w-28" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
            <Button size="sm" onClick={verifyOtp}>Verify & Complete</Button>
            <span className="text-xs text-muted-foreground">(Demo OTP: {r.otp_code})</span>
          </div>
        )}
        {(isCustomer || role === "admin") && !["completed", "cancelled"].includes(r.status) && (
          <Button size="sm" variant="outline" onClick={cancel}>Cancel</Button>
        )}
      </div>
    </div>
  );
}
