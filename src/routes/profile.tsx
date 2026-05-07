import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({ component: () => <AppShell><ProfilePage /></AppShell> });

function ProfilePage() {
  const { user, role } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) setForm({ name: data.name ?? "", phone: data.phone ?? "" });
    });
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").update(form).eq("id", user.id);
    setBusy(false);
    if (error) toast.error(error.message); else toast.success("Profile updated");
  };

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-sm text-muted-foreground">Signed in as {user?.email} · <span className="capitalize">{role}</span></p>
      </div>
      <form onSubmit={save} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div className="space-y-2"><Label>Full Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save Changes"}</Button>
      </form>
    </div>
  );
}
