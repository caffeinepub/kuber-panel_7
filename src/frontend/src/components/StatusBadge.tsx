interface StatusBadgeProps {
  status: "pending" | "approved" | "transfer_successful" | "rejected";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const classes: Record<string, string> = {
    pending: "status-pending",
    approved: "status-approved",
    transfer_successful: "status-approved",
    rejected: "status-rejected",
  };
  const labels: Record<string, string> = {
    pending: "PENDING",
    approved: "APPROVED",
    transfer_successful: "Transfer Successful",
    rejected: "REJECTED",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${classes[status] ?? "status-pending"}`}
    >
      {labels[status] ?? status.toUpperCase()}
    </span>
  );
}
