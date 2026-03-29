import { ORDER_STATUS_LABELS } from "@/lib/format";
import type { OrderStatus } from "@/api/types";

interface Props {
  status: OrderStatus;
}

export default function StatusBadge({ status }: Props) {
  const config = ORDER_STATUS_LABELS[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.color}`}
    >
      {config.label}
    </span>
  );
}
