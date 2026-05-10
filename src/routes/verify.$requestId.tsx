import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_CLASS, STATUS_LABEL } from "@/lib/status";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { z } from "zod";
import { ShieldCheck, Fuel, Wrench, MapPin, Clock, ArrowLeft, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/verify/$requestId")({
  component: () => (
    <AppShell>
      <VerifyPage />
    </AppShell>
  ),
});

const otpSchema = z
  .string()
  .trim()
  .length(4, { message: "OTP must be 4 digits" })
  .regex(/^\d{4}$/, { message: "OTP must contain only digits" });

function VerifyPage() {
  const { requestId } = Route.useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const load = async () => {
    const { data, error } = await supabase.from("requests").select("*").eq("id", requestId).maybeSingle();
    if (error) toast.error(error.message);
    setRequest(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    load();
    // Live updates so the page reflects provider status changes (e.g. when
    // the provider triggers OTP issuance, the code appears here automatically)
    const ch = supabase
      .channel(`verify-${requestId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "requests", filter: `id=eq.${requestId}` },
        (payload) => setRequest((r: any) => ({ ...(r ?? {}), ...(payload.new as any) })),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user, requestId]);

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  if (!request) {
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center">
        <p className="text-muted-foreground">Request not found or you don't have access.</p>
        <Link to="/requests" className="text-sm text-primary underline mt-2 inline-block">
          Back to My Requests
        </Link>
      </div>
    );
  }

  const isCustomer = request.customer_id === user?.id;
  const Icon = request.type === "fuel" ? Fuel : Wrench;
  const completed = request.status === "completed";

  const verify = async () => {
    if (attempts >= 5) return toast.error("Too many attempts. Please contact support.");
    const parsed = otpSchema.safeParse(otp);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    if (!isCustomer) return toast.error("Only the customer who placed this request can verify.");
    if (request.status !== "otp_pending") {
      return toast.error("This request is not awaiting OTP verification yet.");
    }

    setSubmitting(true);
    if (parsed.data !== request.otp_code) {
      setAttempts((a) => a + 1);
      setSubmitting(false);
      setOtp("");
      return toast.error(`Invalid OTP. ${4 - attempts} attempt(s) left.`);
    }

    const { error } = await supabase
      .from("requests")
      .update({ status: "completed", otp_verified: true })
      .eq("id", request.id);
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Service completed successfully!");
    setTimeout(() => nav({ to: "/requests" }), 1200);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/requests" className="text-sm text-muted-foreground inline-flex items-center gap-1 hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to requests
      </Link>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold capitalize">{request.type} Service</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {request.location}
                {request.landmark ? ` (${request.landmark})` : ""}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Clock className="h-3 w-3" /> Placed {new Date(request.created_at).toLocaleString()}
              </p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${STATUS_CLASS[request.status]}`}>
            {STATUS_LABEL[request.status]}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 text-center space-y-5">
        {completed ? (
          <>
            <CheckCircle2 className="h-14 w-14 text-success mx-auto" />
            <div>
              <h2 className="text-xl font-bold">Service Verified & Completed</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Thanks for using FuelRescue. A receipt is available in your request history.
              </p>
            </div>
            <Button asChild>
              <Link to="/requests">View My Requests</Link>
            </Button>
          </>
        ) : request.status !== "otp_pending" ? (
          <>
            <ShieldCheck className="h-14 w-14 text-muted-foreground mx-auto" />
            <div>
              <h2 className="text-xl font-bold">Waiting for Provider</h2>
              <p className="text-sm text-muted-foreground mt-1">
                The OTP will appear here once your provider confirms the service is complete.
                Current status: <span className="font-medium">{STATUS_LABEL[request.status]}</span>.
              </p>
            </div>
          </>
        ) : !isCustomer ? (
          <p className="text-muted-foreground">Only the customer can verify the OTP for this service.</p>
        ) : (
          <>
            <ShieldCheck className="h-14 w-14 text-primary mx-auto" />
            <div>
              <h2 className="text-xl font-bold">Verify Service Completion</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Enter the 4-digit OTP shared by your service provider to confirm the work is done.
              </p>
            </div>

            <div className="flex justify-center">
              <InputOTP maxLength={4} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button onClick={verify} disabled={submitting || otp.length !== 4} className="w-full sm:w-auto">
              {submitting ? "Verifying…" : "Verify & Complete Service"}
            </Button>

            {request.otp_code && (
              <p className="text-xs text-muted-foreground">
                Demo mode: OTP is <span className="font-mono font-semibold">{request.otp_code}</span>
              </p>
            )}
            {attempts > 0 && (
              <p className="text-xs text-destructive">{attempts} failed attempt(s). Max 5 allowed.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
