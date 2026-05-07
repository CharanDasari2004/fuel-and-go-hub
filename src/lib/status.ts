export const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  on_the_way: "On the Way",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const STATUS_CLASS: Record<string, string> = {
  pending: "bg-warning/15 text-warning-foreground border border-warning/40",
  accepted: "bg-secondary text-secondary-foreground border border-border",
  on_the_way: "bg-accent/20 text-accent-foreground border border-accent/40",
  completed: "bg-success/15 text-success border border-success/40",
  cancelled: "bg-muted text-muted-foreground border border-border",
};

export const NEXT_STATUS: Record<string, string | null> = {
  pending: "accepted",
  accepted: "on_the_way",
  on_the_way: "completed",
  completed: null,
  cancelled: null,
};
