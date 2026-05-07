export const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  on_the_way: "Provider On The Way",
  reached: "Reached Location",
  otp_pending: "OTP Verification",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const STATUS_CLASS: Record<string, string> = {
  pending: "bg-warning/15 text-warning-foreground border border-warning/40",
  accepted: "bg-secondary text-secondary-foreground border border-border",
  on_the_way: "bg-accent/20 text-accent-foreground border border-accent/40",
  reached: "bg-accent/30 text-accent-foreground border border-accent/50",
  otp_pending: "bg-primary/15 text-primary border border-primary/40",
  completed: "bg-success/15 text-success border border-success/40",
  cancelled: "bg-muted text-muted-foreground border border-border",
};

// Provider-driven workflow: pending -> accepted -> on_the_way -> reached -> otp_pending -> completed
export const NEXT_STATUS: Record<string, string | null> = {
  pending: "accepted",
  accepted: "on_the_way",
  on_the_way: "reached",
  reached: "otp_pending",
  otp_pending: null, // requires OTP verification by customer
  completed: null,
  cancelled: null,
};

export const NEXT_LABEL: Record<string, string> = {
  pending: "Accept Request",
  accepted: "Start Trip",
  on_the_way: "Mark Reached",
  reached: "Request OTP",
};
