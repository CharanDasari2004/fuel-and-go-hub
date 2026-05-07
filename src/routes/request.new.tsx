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
import { Fuel, MapPin, Clock } from "lucide-react";

export const Route = createFileRoute("/request/new")({ component: () => <AppShell><FuelRequest /></AppShell> });

function FuelRequest() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    location: "",
    landmark: "",
    fuel_type: "Petrol",
    fuel_quantity: 5,
    vehicle_type: "Car",
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
      type: "fuel" as any,
      ...form,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Fuel request submitted — providers notified");
    nav({ to: "/requests" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Fuel className="text-primary" /> Request Fuel Delivery</h1>
        <p className="text-muted-foreground text-sm">Fill out the details and a nearby provider will be dispatched.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_280px]">
        <form onSubmit={submit} className="space-y-4 rounded-xl border border-border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name"><Input required value={form.full_name} onChange={(e) => set("full_name", e.target.value)} /></Field>
            <Field label="Phone Number"><Input required value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
          </div>
          <Field label="Current Address">
            <div className="flex gap-2">
              <Input required value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Street, area, city" />
              <Button type="button" variant="outline" onClick={() => toast.info("Map picker coming soon")}> <MapPin className="h-4 w-4 mr-1" /> Map</Button>
            </div>
          </Field>
          <Field label="Landmark"><Input value={form.landmark} onChange={(e) => set("landmark", e.target.value)} placeholder="Near…" /></Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Fuel Type">
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.fuel_type} onChange={(e) => set("fuel_type", e.target.value)}>
                <option>Petrol</option><option>Diesel</option>
              </select>
            </Field>
            <Field label="Quantity (Litres)"><Input type="number" min={1} max={50} required value={form.fuel_quantity} onChange={(e) => set("fuel_quantity", Number(e.target.value))} /></Field>
            <Field label="Vehicle Type">
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.vehicle_type} onChange={(e) => set("vehicle_type", e.target.value)}>
                <option>Car</option><option>Bike</option><option>SUV</option><option>Truck</option>
              </select>
            </Field>
          </div>
          <Field label="Emergency Notes"><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Anything we should know?" /></Field>
          <Button type="submit" disabled={busy} className="w-full">{busy ? "Sending…" : "Request Fuel Now"}</Button>
        </form>

        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Estimated Arrival</h3>
            <p className="text-3xl font-bold mt-1">15-25 min</p>
            <p className="text-xs text-muted-foreground">Based on nearby providers</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold">Nearby Providers</h3>
            <ul className="mt-2 space-y-2 text-sm">
              {["Ravi · 1.2 km", "Anita · 2.4 km", "FuelOnGo · 3.1 km"].map((p) => (
                <li key={p} className="flex justify-between"><span>{p}</span><span className="text-success">● Online</span></li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
