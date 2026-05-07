import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Fuel, Wrench, ShieldCheck, Disc3, Moon, Mountain, Phone,
  Users, Clock, CheckCircle2, MapPin, Send, KeyRound, Star,
} from "lucide-react";
import hero from "@/assets/hero-rescue.jpg";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => { if (!loading && user) nav({ to: "/dashboard" }); }, [user, loading, nav]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 font-bold text-lg">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground"><Fuel className="h-5 w-5" /></span>
            FuelRescue
          </div>
          <nav className="hidden md:flex gap-6 text-sm text-muted-foreground">
            <a href="#services" className="hover:text-foreground">Services</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#stats" className="hover:text-foreground">Stats</a>
            <a href="#reviews" className="hover:text-foreground">Reviews</a>
          </nav>
          <div className="flex gap-2">
            <Link to="/login"><Button variant="ghost">Sign in</Button></Link>
            <Link to="/signup"><Button>Get started</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-20 grid gap-10 md:grid-cols-2 items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" /> 24/7 Emergency Response
          </span>
          <h1 className="mt-4 text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            24/7 Emergency Fuel & <span className="text-primary">Vehicle Assistance</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Get emergency fuel delivery and roadside mechanic support anytime, anywhere — verified providers, OTP-secured service, live tracking.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/signup"><Button size="lg">🚨 Request Assistance</Button></Link>
            <Link to="/signup"><Button size="lg" variant="outline">Become a Provider</Button></Link>
          </div>
          <div className="mt-6 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-success" /> Verified providers</div>
            <div className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-success" /> OTP secured</div>
            <div className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-success" /> Live tracking</div>
          </div>
        </div>
        <div className="relative">
          <img src={hero} alt="Roadside fuel delivery technician helping a stranded driver"
               width={1536} height={1024}
               className="rounded-2xl border border-border shadow-2xl aspect-[3/2] object-cover" />
          <div className="absolute -bottom-4 -left-4 rounded-xl bg-card border border-border p-3 shadow-lg hidden sm:block">
            <div className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-primary" /> Avg response <b>18 min</b></div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="mx-auto max-w-6xl px-4 py-16">
        <SectionTitle eyebrow="What we do" title="Help for every kind of breakdown" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <div key={s.title} className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/50 hover:shadow-lg transition">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition">
                <s.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-semibold text-lg">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-secondary/40 border-y border-border">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <SectionTitle eyebrow="How it works" title="Help in 5 simple steps" />
          <div className="mt-10 grid gap-4 md:grid-cols-5">
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative rounded-xl border border-border bg-card p-5 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground"><s.icon className="h-5 w-5" /></div>
                <div className="mt-3 text-xs font-bold text-primary">STEP {i + 1}</div>
                <div className="font-semibold mt-1">{s.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="mx-auto max-w-6xl px-4 py-16">
        <SectionTitle eyebrow="By the numbers" title="Trusted across the highway" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-gradient-to-br from-card to-secondary/30 p-6">
              <s.icon className="h-6 w-6 text-primary" />
              <div className="mt-3 text-3xl font-bold">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="reviews" className="bg-secondary/40 border-y border-border">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <SectionTitle eyebrow="Real stories" title="Loved by stranded drivers" />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {REVIEWS.map((r) => (
              <div key={r.name} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex gap-0.5 text-warning">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
                <p className="mt-3 text-sm">"{r.quote}"</p>
                <div className="mt-4 text-sm font-medium">{r.name}<span className="text-muted-foreground font-normal"> · {r.city}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold">Ready when you are.</h2>
        <p className="mt-3 text-muted-foreground">Sign up free — request help in under 60 seconds.</p>
        <div className="mt-6"><Link to="/signup"><Button size="lg">Create free account</Button></Link></div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 md:grid-cols-3 text-sm">
          <div>
            <div className="flex items-center gap-2 font-bold"><Fuel className="h-4 w-4 text-primary" /> FuelRescue</div>
            <p className="mt-2 text-muted-foreground">On-road emergency fuel delivery and vehicle assistance, 24/7.</p>
          </div>
          <div>
            <div className="font-semibold">Emergency Support</div>
            <a href="tel:1800-111-222" className="mt-2 flex items-center gap-2 text-primary font-bold text-lg"><Phone className="h-4 w-4" /> 1800-111-222</a>
            <p className="text-xs text-muted-foreground">Toll-free · 24×7</p>
          </div>
          <div>
            <div className="font-semibold">About</div>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              <li>Trusted by 12k+ drivers</li>
              <li>Verified providers in 80+ cities</li>
              <li>contact@fuelrescue.app</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} FuelRescue</div>
      </footer>
    </div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center">
      <div className="text-xs font-bold uppercase tracking-widest text-primary">{eyebrow}</div>
      <h2 className="mt-2 text-3xl md:text-4xl font-bold">{title}</h2>
    </div>
  );
}

const SERVICES = [
  { icon: Fuel, title: "Fuel Delivery", desc: "Petrol or diesel delivered fast — no more pushing your car." },
  { icon: Disc3, title: "Puncture Repair", desc: "On-spot tyre fixes from verified mechanics." },
  { icon: Wrench, title: "Emergency Mechanic", desc: "Battery, brake, engine — help is on the way." },
  { icon: Moon, title: "Women Night Safety", desc: "Priority response and women-friendly providers after dark." },
  { icon: Mountain, title: "Highway Rescue", desc: "Coverage across highways and remote village routes." },
  { icon: ShieldCheck, title: "OTP-Verified Service", desc: "Every job is confirmed with a one-time code for safety." },
];

const STEPS = [
  { icon: Send, title: "Request Service" },
  { icon: CheckCircle2, title: "Provider Accepts" },
  { icon: MapPin, title: "On the Way" },
  { icon: KeyRound, title: "OTP Verification" },
  { icon: ShieldCheck, title: "Service Completed" },
];

const STATS = [
  { icon: Users, value: "1,200+", label: "Providers Available" },
  { icon: Fuel, value: "48,300", label: "Fuel Deliveries Completed" },
  { icon: Wrench, value: "320", label: "Mechanics Online" },
  { icon: Clock, value: "18 min", label: "Avg Response Time" },
];

const REVIEWS = [
  { name: "Aarav S.", city: "Mumbai", quote: "Ran out of petrol on the expressway at 2am. Help arrived in 20 minutes. Lifesaver." },
  { name: "Priya K.", city: "Bengaluru", quote: "Loved the OTP verification — felt completely safe as a woman traveling alone." },
  { name: "Ramesh T.", city: "Hyderabad", quote: "Mechanic fixed my puncture on the spot. Clean app, clear pricing." },
];
