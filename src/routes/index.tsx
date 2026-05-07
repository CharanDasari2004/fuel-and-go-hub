import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Fuel, Wrench, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { user, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && user) nav({ to: "/dashboard" });
  }, [user, loading, nav]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 font-bold text-lg">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Fuel className="h-4 w-4" />
            </span>
            RoadAid
          </div>
          <div className="flex gap-2">
            <Link to="/login"><Button variant="ghost">Sign in</Button></Link>
            <Link to="/signup"><Button>Get started</Button></Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4">
        <section className="py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Stranded? Help is <span className="text-primary">on the way.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            On-road emergency fuel delivery and mechanic dispatch — request help in seconds, track until it arrives.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/signup"><Button size="lg">Request assistance</Button></Link>
            <Link to="/login"><Button size="lg" variant="outline">I'm a provider</Button></Link>
          </div>
        </section>
        <section className="grid gap-4 md:grid-cols-3 pb-16">
          {[
            { icon: Fuel, title: "Fuel Delivery", desc: "Out of gas? We bring fuel directly to your location." },
            { icon: Wrench, title: "Mechanic Dispatch", desc: "Roadside repairs from verified service providers." },
            { icon: ShieldCheck, title: "Live Tracking", desc: "Track your request from pending to completed." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-6">
              <f.icon className="h-6 w-6 text-primary mb-3" />
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
