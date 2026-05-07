import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Wrench } from "lucide-react";

export const Route = createFileRoute("/request/mechanic")({ component: () => <AppShell><MechReq /></AppShell> });

const PROBLEMS = ["Puncture", "Battery Issue", "Engine Problem", "Brake Failure", "Fuel Leakage", "Other"];

function MechReq() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    vehicle_type: "Car",
    vehicle_model: "",
    problem_type: "Puncture",
    location: "",
    description: "",
  });
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("requests").insert({
      customer_id: user.id,
      type: "mechanic" as any,
      ...form,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Mechanic request submitted");
    nav({ to: "/requests" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Wrench className="text-primary" /> Request Mechanic</h1>
        <p className="text-muted-foreground text-sm">Roadside repairs from verified providers.</p>
      </div>
      <form onSubmit={submit} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full Name"><Input required value={form.full_name} onChange={(e) => set("full_name", e.target.value)} /></Field>
          <Field label="Phone Number"><Input required value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Vehicle Type">
            <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.vehicle_type} onChange={(e) => set("vehicle_type", e.target.value)}>
              <option>Car</option><option>Bike</option><option>SUV</option><option>Truck</option>
            </select>
          </Field>
          <Field label="Vehicle Model"><Input required value={form.vehicle_model} onChange={(e) => set("vehicle_model", e.target.value)} placeholder="e.g. Honda Activa 6G" /></Field>
        </div>
        <Field label="Problem Type">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PROBLEMS.map((p) => (
              <button type="button" key={p} onClick={() => set("problem_type", p)}
                className={`rounded-lg border px-3 py-2 text-sm transition ${form.problem_type === p ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-secondary"}`}>
                {p}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Address"><Input required value={form.location} onChange={(e) => set("location", e.target.value)} /></Field>
        <Field label="Notes"><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} /></Field>
        <Button type="submit" disabled={busy} className="w-full">{busy ? "Sending…" : "Send Request"}</Button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
