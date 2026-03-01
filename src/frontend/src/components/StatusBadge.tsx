interface StatusBadgeProps {
  status: "pending" | "approved" | "rejected";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const classes = {
    pending: "status-pending",
    approved: "status-approved",
    rejected: "status-rejected",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${classes[status]}`}
    >
      {status.toUpperCase()}
    </span>
  );
}
